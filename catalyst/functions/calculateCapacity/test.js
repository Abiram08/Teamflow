const calculateCapacity = require('./index');
const catalyst = require('zcatalyst-sdk-node');
const pMap = require('p-map');

jest.mock('zcatalyst-sdk-node');
jest.mock('p-map', () => jest.fn((array, mapper) => Promise.all(array.map(mapper))));

describe('calculateCapacity', () => {
    let mockContext;
    let mockDatastore;
    let mockZcql;

    beforeEach(() => {
        mockContext = {
            closeWithSuccess: jest.fn(),
            closeWithFailure: jest.fn()
        };

        mockDatastore = {
            table: jest.fn().mockReturnValue({
                getPagedRows: jest.fn().mockResolvedValue({ data: [] }),
                insertRows: jest.fn().mockResolvedValue(true)
            })
        };

        mockZcql = {
            executeZCQLQuery: jest.fn().mockResolvedValue([])
        };

        catalyst.initialize.mockReturnValue({
            datastore: () => mockDatastore,
            zcql: () => mockZcql
        });
    });

    test('should calculate capacity correctly', async () => {
        // Mock Settings (First call) and Users (Second call)
        const mockGetPagedRows = mockDatastore.table().getPagedRows;
        mockGetPagedRows
            .mockResolvedValueOnce({ data: [{ max_capacity_base: 10 }] })
            .mockResolvedValueOnce({ data: [{ user_id: 'u1' }] });

        // Mock Tasks (High priority, due < 24h -> weight 3 * 2 = 6)
        mockZcql.executeZCQLQuery.mockImplementation((query) => {
            if (query.includes('SELECT * FROM tasks')) {
                return Promise.resolve([
                    { tasks: { priority: 'High', due_date: new Date(Date.now() + 3600000).toISOString() } } // 1 hour from now
                ]);
            }
            return Promise.resolve([]);
        });

        await calculateCapacity({}, mockContext);

        // Verify Insert
        expect(mockDatastore.table).toHaveBeenCalledWith('capacity_cache');
        const insertCall = mockDatastore.table('capacity_cache').insertRows.mock.calls[0][0];
        expect(insertCall[0]).toMatchObject({
            user_id: 'u1',
            weighted_load: 6,
            capacity_percent: 60, // 6 / 10 * 100
            status: 'Busy' // 60% is > 40 and < 80
        });
    });
});
