const detectOverload = require('./index');
const catalyst = require('zcatalyst-sdk-node');

jest.mock('zcatalyst-sdk-node');

describe('detectOverload', () => {
    let mockContext;
    let mockFunctions;
    let mockDatastore;

    beforeEach(() => {
        mockContext = {
            closeWithSuccess: jest.fn(),
            closeWithFailure: jest.fn()
        };

        mockFunctions = {
            execute: jest.fn().mockResolvedValue(true),
            getFunctionDetails: jest.fn()
        };

        mockDatastore = {
            table: jest.fn().mockReturnValue({
                getPagedRows: jest.fn().mockResolvedValue({ data: [{ channel_id: '123' }] })
            })
        };

        catalyst.initialize.mockReturnValue({
            functions: () => mockFunctions,
            datastore: () => mockDatastore
        });
    });

    test('should trigger notification on status flip to Overloaded', async () => {
        const event = {
            data: {
                user_id: 'u1',
                user_name: 'Alice',
                old_status: 'Busy',
                new_status: 'Overloaded',
                capacity_percent: 85
            }
        };

        await detectOverload(event, mockContext);

        expect(mockFunctions.execute).toHaveBeenCalledWith('sendNotification', expect.objectContaining({
            message: expect.stringContaining('Alice is now **Overloaded**'),
            channel_id: '123'
        }));
    });

    test('should NOT trigger notification if status did not change', async () => {
        const event = {
            data: {
                user_id: 'u1',
                old_status: 'Overloaded',
                new_status: 'Overloaded'
            }
        };

        await detectOverload(event, mockContext);

        expect(mockFunctions.execute).not.toHaveBeenCalled();
    });
});
