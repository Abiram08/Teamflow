const sendNotification = require('./index');

describe('sendNotification', () => {
    let mockContext;

    beforeEach(() => {
        mockContext = {
            closeWithSuccess: jest.fn(),
            closeWithFailure: jest.fn()
        };
    });

    test('should log and succeed', async () => {
        const event = {
            data: {
                message: "Hello World",
                channel_id: "123"
            }
        };

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        await sendNotification(event, mockContext);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Notification] To: 123'));
        expect(mockContext.closeWithSuccess).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
