import { defaultResolver } from 'jest-resolve';

function resolver(request, options) {
    // Log resolution attempts
    console.log('\nModule Resolution Debug:');
    console.log('Resolving:', request);
    console.log('From:', options.basedir);
    
    return defaultResolver(request, options);
}

export function sync(request, options) {
    return resolver(request, options);
}

export function async(request, options) {
    return Promise.resolve(resolver(request, options));
} 