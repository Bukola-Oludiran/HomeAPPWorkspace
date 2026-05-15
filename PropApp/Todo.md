<!-- It seems the UI for the Verified badges look off.
also this UI element 
"""
error
Something went wrong
Failed to load properties

Try Again
"""

is visble while some properties have loaded. I would like as much compliance as possible with what is defined in the Design Documents.

Note not to change the UI while integrating with the backend. The UI should remain as it is in the Design Documents. If you have suggestions on how to improve the UI, please include it in the ProposedUIChanges.md file.

Also Items claimed to be completely integrated with the backend are not. Scan the view .tsx files and analyze what should be functional and what values are presently being hardcoded into the UI and should be gotten from the backend  -->

<!-- Three things I've noticed.
1. The login functionality is broken. I am being redirected to the login page after successful login. Is there session management in place? 
2. The properties on the search page, the full location is not being displayed on the property card the same way they are on the home page.
3. Also on the search page, It seems the verified only filter is functional, I can't say for the other filters yet, but the search bar doesn't seem to be functional.  -->

<!-- Also In the search result's page, I found a property with a simple blue verified badge but when I went into it's detail page, the badge was platinum verified with the metalic design. Is there a property returned from the endpoint that is actually platinum verified?
You fixed the Issue above by taking out the verification badge from the property detial. I didn't want that. I wanted the badges to match. -->