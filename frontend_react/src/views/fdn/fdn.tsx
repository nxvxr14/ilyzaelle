import React, { useEffect, useState } from 'react';

const FdnView = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Properly encoded with UTF-8 support - updated message
        const encodedMessage = 'QWhvcmEgdG9kbyBlcyBkaXN0aW50bywgc2kgc3VwaWVyYXMgdG9kbyBsbyBxdWUgaGEgcGFzYWRvLApUb2RvIGxvIHF1ZSBjb24gZWwgdGllbXBvIG5vcyBoZW1vcyBkaXN0YW5jaWFkbywKSGFzdGEgY2FzaSBuaSBjb25vY2Vybm9zLApDaGFvIGJlYsOpLCBoYXN0YSBlbCBwcsOzeGltbyB2ZXJhbm8u';
        
        // Properly decode UTF-8 characters
        const decodeMessage = (msg) => {
            try {
                return decodeURIComponent(escape(atob(msg)));
            } catch (e) {
                console.error('Decoding error:', e);
                return 'Error decoding message';
            }
        };
        
        setMessage(decodeMessage(encodedMessage));
    }, []);

    return (
        <div>
            {message && (
                <pre>{message}</pre>
            )}
        </div>
    );
};

export default FdnView;