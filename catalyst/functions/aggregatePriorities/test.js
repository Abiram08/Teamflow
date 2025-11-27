const aggregatePriorities = require('./index');
const catalyst = require('zcatalyst-sdk-node');

jest.mock('zcatalyst-sdk-node');
jest.mock('p-map', () => jest.fn((array, mapper) => Promise.all(array.map(mapper))));

describe('aggregatePriorities', () => {
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

    test('should score and store top priorities', async () => {
        // Mock Users
        mockDatastore.table('team_members').getPagedRows.mockResolvedValue({
            data: [{ user_id: 'u1' }]
        });

        // Mock Tasks
        mockZcql.executeZCQLQuery.mockImplementation((query) => {
            if (query.includes('SELECT * FROM tasks')) {
                return Promise.resolve([
                    { tasks: { task_id: 't1', priority: 'High', due_date: new Date(Date.now() - 3600000).toISOString() } }, // Overdue
                    { tasks: { task_id: 't2', priority: 'Low' } }
                ]);
            }
            return Promise.resolve([]);
        });

        await aggregatePriorities({}, mockContext);

        // Verify Insert
        expect(mockDatastore.table).toHaveBeenCalledWith('priority_scores');
        const insertCall = mockDatastore.table('priority_scores').insertRows.mock.calls[0][0];

        // t1 should have higher score (High + Overdue)
        expect(insertCall[0].item_id).toBe('t1');
        expect(insertCall[0].score).toBeGreaterThan(50);
    });
});
