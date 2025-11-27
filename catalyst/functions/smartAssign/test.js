const smartAssign = require('./index');
const catalyst = require('zcatalyst-sdk-node');

jest.mock('zcatalyst-sdk-node');

describe('smartAssign', () => {
    let mockContext;
    let mockDatastore;

    beforeEach(() => {
        mockContext = {
            closeWithSuccess: jest.fn(),
            closeWithFailure: jest.fn()
        };

        mockDatastore = {
            table: jest.fn().mockReturnValue({
                getPagedRows: jest.fn().mockResolvedValue({ data: [] })
            })
        };

        catalyst.initialize.mockReturnValue({
            datastore: () => mockDatastore,
            zcql: () => ({ executeZCQLQuery: jest.fn() })
        });
    });

    test('should return top candidates based on score', async () => {
        // Mock Users (First call) and Capacity (Second call)
        const mockGetPagedRows = mockDatastore.table().getPagedRows;
        mockGetPagedRows
            .mockResolvedValueOnce({
                data: [
                    { user_id: 'u1', name: 'Alice', skills: ['react', 'node'] },
                    { user_id: 'u2', name: 'Bob', skills: ['design'] }
                ]
            })
            .mockResolvedValueOnce({
                data: [
                    { user_id: 'u1', capacity_percent: 30 }, // Available -> 50 pts
                    { user_id: 'u2', capacity_percent: 90 }  // Critical -> 10 pts
                ]
            });

        // Test Input
        const event = {
            data: { task_description: "Build a React frontend" }
        };

        await smartAssign(event, mockContext);

        expect(mockContext.closeWithSuccess).toHaveBeenCalled();
        const result = mockContext.closeWithSuccess.mock.calls[0][0];

        expect(result.length).toBe(2);
        expect(result[0].user_id).toBe('u1'); // Alice should be first
        // Alice: Avail(50) + Skill(40, 'react' matches) + Perf(10) = 100
        // Bob: Avail(10) + Skill(5, no match) + Perf(10) = 25
        expect(result[0].score).toBe(100);
        expect(result[1].score).toBe(25);
    });
});
