const fetchTeamData = require('./index');
const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');

jest.mock('zcatalyst-sdk-node');
jest.mock('axios');

describe('fetchTeamData', () => {
    let mockContext;
    let mockDatastore;
    let mockTable;

    beforeEach(() => {
        mockContext = {
            closeWithSuccess: jest.fn(),
            closeWithFailure: jest.fn()
        };

        mockTable = {
            insertRows: jest.fn().mockResolvedValue(true)
        };

        mockDatastore = {
            table: jest.fn().mockReturnValue(mockTable)
        };

        catalyst.initialize.mockReturnValue({
            datastore: () => mockDatastore
        });

        axios.create.mockReturnValue({
            interceptors: {
                response: { use: jest.fn() }
            },
            get: jest.fn()
        });
    });

    test('should fetch users and sync to datastore', async () => {
        const mockAxios = axios.create();

        // Mock Portals
        mockAxios.get.mockResolvedValueOnce({
            data: { portals: [{ id: '123' }] }
        });

        // Mock Users
        mockAxios.get.mockResolvedValueOnce({
            data: { users: [{ id: 'u1', name: 'Alice', email: 'alice@example.com' }] }
        });

        // Mock Projects
        mockAxios.get.mockResolvedValueOnce({
            data: { projects: [] } // No projects for this simple test
        });

        await fetchTeamData({}, mockContext);

        expect(mockDatastore.table).toHaveBeenCalledWith('team_members');
        expect(mockTable.insertRows).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ user_id: 'u1', name: 'Alice' })
        ]));
        expect(mockContext.closeWithSuccess).toHaveBeenCalled();
    });

    test('should handle API errors', async () => {
        const mockAxios = axios.create();
        mockAxios.get.mockRejectedValue(new Error('API Error'));

        await fetchTeamData({}, mockContext);

        expect(mockContext.closeWithFailure).toHaveBeenCalledWith(expect.stringContaining('API Error'));
    });
});
