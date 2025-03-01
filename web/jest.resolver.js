module.exports = (request, options) => {
    // Log resolution attempts
    console.log('\nModule Resolution Debug:');
    console.log('Resolving:', request);
    console.log('From:', options.basedir);
    
    // Use the default resolver
    return options.defaultResolver(request, options);
}; 