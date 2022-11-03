try {

async function sendRequest( token, method, params )
{
    const result = await fetch( `https://api.telegram.org/bot${ token }/${ method }?${ params }` )
    .then( res => res.json( ) )
    return result
}
class Bot {
    constructor ( token )
    {
        this.token = token
    }
    async getMe( )
    {
        return await sendRequest( this.token, 'getMe' )
    }
    async getUpdates( params )
    {
        return await sendRequest( this.token, 'getUpdates', params)
    }
    async ForgetAll( )
    {
        this.getUpdates( ).then( response => {
            if( response.result == false || response.result == undefined ) return
            this.getUpdates( `offset=${ response.result.slice(-1)[0].update_id+1 }` ) 
        } )
    }
    async sendMessage( chat_id, text )
    {
        return await sendRequest( this.token, 'sendMessage', `chat_id=${chat_id}&text=${text}`)
    }
    async StatusCheckFeedrum( )
    {
        return await fetch( 'https://feedrum.com' ).then( response => response.status )
    }
}

const Feed = new Bot( 'Here must be token' ) // TOKEN 
Feed.ForgetAll( )
setInterval( ( ) => {

    Feed.getUpdates( ).then( response => {
        Feed.ForgetAll( )
        if( response.ok == false || response.result == undefined || response.result == false ) return
        if( response.result.slice( -1 )[ 0 ].message.text.startsWith( '/status' ) )
        {
            const ChatID = response.result.slice( -1 )[ 0 ].message.chat.id
            Feed.StatusCheckFeedrum( ).then( status => {
                if( status === 200 ) status = `🟢 'OK' 200`
                if( status >= 300 && status < 400 ) status = `🟠 'Redirecting' ${ status }`
                if( status >= 400 && status < 500 ) status = `🔴 'User Problem' ${ status }`
                if( status >= 500 && status < 600 ) status = `🔴 'Server Problem' ${ status }`
                Feed.sendMessage( ChatID, status )
                Feed.ForgetAll( )
            } )
        }

    } )
    Feed.ForgetAll( )

}, 200 )

} catch ( err ) {
    console.error(err)
}