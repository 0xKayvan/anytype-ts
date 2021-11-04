import { I } from 'ts/lib';

const { app } = window.require('@electron/remote');
const path = app.getPath('userData');

export default [
	{ type: I.BlockType.Cover, param: { type: I.CoverType.Gradient, className: 'pinkOrange' } },
	{ type: I.BlockType.IconPage, icon: '🚀' },
	{ style: I.TextStyle.Title, text: `Welcome to Anytype!` },
	{ text: `Anytype is a personal knowledge base, a digital brain that allows you to quickly capture, describe, and connect information. You can use Anytype to create books, tasks, notes, ideas, documents, tools and organise them any way you want.` },
	{ style: I.TextStyle.Header1, text: `A new metaphor` },
	{ text: `Our mission is to change the role of software in our lives. Anytype is built around a new metaphor, which replaces apps with objects. They are small, easy to create, share, and remix. They will help more of us build the software we want.` },
	{ text: `This is our first version designed with our metaphor. It introduces several new features:` },
	{ style: I.TextStyle.Bulleted, text: `Multiple object types and the power to connect them with relations.` },
	{ style: I.TextStyle.Bulleted, text: `Layouts and templates help you save time on repetitive tasks.` },
	{ style: I.TextStyle.Bulleted, text: `Finally, you can now work with multiple objects using Sets, creating tables, galleries, and (soon) boards.` },
	{ text: `Future versions will allow you to share your objects and collaborate with others. This is our next step towards our vision of a global repository of knowledge.` },

	{ style: I.TextStyle.Header1, text: `Privacy and Security` },
	{ style: I.TextStyle.Header3, text: `Encryption` },
	{ text: `Your data is stored on your devices and encrypted with a keychain phrase. The keychain phrase is something only you know, please keep it safe. You need it to sign in to new devices. If you lose it Anytype cannot help you recover your data. ` },
	{ text: `<i>Read more about <a href="https://community.anytype.io/d/271-privacy-security">privacy</a>.</i> ` },
	{ style: I.TextStyle.Header3, text: `Backup and Syncing` },
	{ text: `One feature of the alpha program is a decentralised and encrypted backup node. This is provided free of charge to all alpha testers. Your objects are encrypted and synced to our cafe nodes. If your device is lost or damaged, you can restore the latest snapshot from our backup node. This feature is currently in early alpha. Data on the backup node is encrypted, and the Anytype team cannot access your data.` },
	{ text: `<i>Read more about <a href="https://community.anytype.io/d/248-syncing-p2p">syncing & P2P</a> and <a href="https://community.anytype.io/d/272-storage-deletion">storage & deletion</a>.</i> ` },
	{ style: I.TextStyle.Header1, text: `Objects` },
	{ text: `Everything in Anytype is an object: people, books, musicians, documents, ideas, places, numbers or files. For instance, a person named "Enda", an essay to write, the music of "Pink Floyd", the film "2001", a town named "Berlin", a year, or just a simple status like "Done". ` },
	{ text: `<img src="./img/help/intro/d2b5ca33bd970f64a6301fa75ae2eb22.png" class="full" />` },
	{ style: I.TextStyle.Header3, text: `Object canvas` },
	{ text: `Every object has a flexible canvas made of simple blocks. Each block is a piece of information which you can freely move around the canvas. You can add any information you like by hitting the <kbd>+</kbd> button or in-line by typing <kbd>/</kbd>. Highlight a block to see its size or move it elsewhere on the canvas. To create a column, simply drag one block to the end of another block.` },
	{ text: `<b>The following blocks are available in this version of Anytype:</b>` },
	{ style: I.TextStyle.Bulleted, text: `Text: text, title, heading, subheading, highlighted` },
	{ style: I.TextStyle.Bulleted, text: `Lists: checkbox, bulleted list, numbered, toggle` },
	{ style: I.TextStyle.Bulleted, text: `Media: file, picture, video, bookmark, code-snippet` },
	{ style: I.TextStyle.Bulleted, text: `Objects: create new objects (tasks, people, documents), or link to an existing object` },
	{ style: I.TextStyle.Bulleted, text: `Relations: all relations for this object` },
	{ style: I.TextStyle.Bulleted, text: `Others: line divider, dotted divider` },
	{ style: I.TextStyle.Header3, text: `<b>Object layout</b>` },
	{ text: `Layouts help you customise how your object looks. You can align your text blocks, customise the icon type, or change the page width.` },
	{ text: `<b>Anytype currently supports three kinds of layout:</b>` },
	{ style: I.TextStyle.Bulleted, text: `<b>Basic:</b> a classic view for notes, articles, and docs. ` },
	{ style: I.TextStyle.Bulleted, text: `<b>Profile:</b> designed for contacts, people, and organisations. ` },
	{ style: I.TextStyle.Bulleted, text: `<b>Action:</b> for getting things done. Perfect for tasks and plans.` },
	{ text: `We designed layouts to be extendable. In the future anyone can make new layouts.` },
	{ text: `Both the basic and profile layout support either an emoji or a photo icon. All layouts support a cover image.` },
	{ style: I.TextStyle.Header1, text: `Knowledge Graph` },
	{ text: `<img src="./img/help/intro/24e0aacf67998dbe6a39efb127ba86f4.png" class="full" />` },
	{ text: `Your objects combine to form a unique knowledge graph. It's a universal data structure, and a strong foundation for automation. We want Anytype to be a modular platform for machine learning and plan to release our first modules for the public beta. ` },
	{ style: I.TextStyle.Header1, text: `Relations` },
	{ text: `<img src="./img/help/intro/55634384f007cf8c9a5e9a4dbc97ed15.png" class="full" />` },
	{ text: `We use <b>relations</b> to connect objects in the graph. They add context and significance to each connection. For instance, Patrick was born in 1984, he lives in Berlin, and he just finished an essay. His favourite band is Pink Floyd and his favourite movie is <i>2001: A Space Odyssey</i>. Patrick is connected to each of these objects with relations like "date of birth", "location", "last task", "band", and "movie".` },
	{ text: `<b>Common Relations:</b>` },
	{ style: I.TextStyle.Bulleted, text: `<b>Name:</b> the name of an object.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Type:</b> defines how an object looks and its default relations.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Tag:</b> a typical relation used to label an object for future reference.` },
	{ style: I.TextStyle.Header2, text: `Managing relations in Anytype` },
	{ text: `Choose from any relation available in your library. Inside the library, you will find relations created by Anytype and you.` },
	{ text: `<img src="./img/help/intro/relations.png" class="full" />` },
	{ style: I.TextStyle.Header3, text: `Open all object's relations` },
	{ style: I.TextStyle.Bulleted, text: `You can open all relations related to object by clinging on the button "Relations" on the top of the object. This panel shows all relations in that particaular object. Here you can add new relations or modify existing ones.` },
	{ style: I.TextStyle.Bulleted, text: `If you want to pin a concrete relation under the object's name, you need to click the ★ next to the relation in the relations panel.` },
	{ text: `<video src="./img/help/intro/relations-panel.mp4" preload controls class="full" />` },
	{ style: I.TextStyle.Header3, text: `Add relation to canvas` },
	{ text: `You can add a relation in the editor like any other block — with a <kbd>+</kbd> button or the in-line <kbd>/</kbd> menu.` },
	{ text: `<video src="./img/help/intro/relations-canvas.mp4" preload controls class="full" />` },
	{ style: I.TextStyle.Header3, text: `Creating a new relation from scratch` },
	{ text: `You can easily create an entirely new relation from scratch. It will then be added to your library, ready for use across your Anytype.` },
	{ text: `<video src="./img/help/intro/relations-create-new-inline.mp4" preload controls class="full" />`, align: I.BlockAlign.Center},
	{ style: I.TextStyle.Header3, text: `Types of relations available` },
	{ style: I.TextStyle.Bulleted, text: `<b>Text:</b> accepts text as the input. ` },
	{ style: I.TextStyle.Bulleted, text: `<b>Number:</b> for all numbers. Different formats are coming soon.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Date:</b> date, optional input for time.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Status:</b> an array of the string with a restriction on the output of only one element.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Tag:</b> another array of the string with no restrictions on the output of only one element.` },
	{ style: I.TextStyle.Bulleted, text: `<b>email/phone/URL:</b> special formats for URL, email and phone number.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Checkbox:</b> an object with a boolean, string, or link to an object.` },
	{ style: I.TextStyle.Bulleted, text: `<b>Media:</b> audio, movies, or pictures which you can view, play, or download. ` },
	{ style: I.TextStyle.Bulleted, text: `<b>Object:</b> reference to a specific object, like a person, task or document.` },
	{ text: `` },
	{ text: `At present relations cannot be deleted. Be careful to avoid duplicate relations with the same name. ` },
	{ style: I.TextStyle.Header3, text: `Tips` },
	{ style: I.TextStyle.Bulleted, text: `Relations included with Anytype cannot currently be modified.` },
	{ style: I.TextStyle.Bulleted, text: `Some relations are read-only, and you cannot change their value. Relations such as <kbd>Created</kbd> or <kbd>Last modified</kbd>. Read-only relations have the 🔒 icon next to them. ` },
	{ style: I.TextStyle.Bulleted, text: `If you add a new relation to a Set, Anytype will not add empty values to the relations in that set. However, when you open an object, that relation will be suggested to you.` },
	{ style: I.TextStyle.Bulleted, text: `When creating an object, Anytype will display empty values in the list of relations.` },
	{ text: `Relations are shared across your Anytype. Renaming a relation in one object will change it's name across all objects` },
	{ text: `<i><a href="https://community.anytype.io/d/935-how-can-i-add-relations-to-all-existing-objects-with-one-type">How can I add relations to all existing objects with one Type?</a></i> ` },
	{ style: I.TextStyle.Header1, text: `Types` },
	{ text: `Types bring definition to your objects, informing how they look and the relations they feature. You can always change your object's type. What begins as an idea can turn into a task and eventually a project. Your types and their changes sync automatically between your devices.` },
	{ text: `<img src="./img/help/intro/types-store.png" class="full" />` },
	{ text: `<b>Types included with Anytype:</b>` },
	{ style: I.TextStyle.Bulleted, text: `Tasks ` },
	{ style: I.TextStyle.Bulleted, text: `Contacts` },
	{ style: I.TextStyle.Bulleted, text: `Projects` },
	{ style: I.TextStyle.Bulleted, text: `Notes` },
	{ style: I.TextStyle.Bulleted, text: `Articles` },
	{ style: I.TextStyle.Bulleted, text: `Ideas` },
	{ style: I.TextStyle.Bulleted, text: `Humans ` },
	{ style: I.TextStyle.Bulleted, text: `Books` },
	{ style: I.TextStyle.Bulleted, text: `& more` },
	{ text: `Use the <b>draft</b> to quickly create new objects and capture information. Drafts don't support templates or layouts.` },
	{ text: `<i><a href="https://community.anytype.io/d/936-what-happens-when-changing-an-objects-type">What happens when changing an object's type?</a></i> ` },
	{ style: I.TextStyle.Header2, text: `<b>Creating types</b>` },
	{ text: `To create a new type, use the "Create a new type" button in the library. You can choose the default <b>relations</b>, <b>layout</b>, and optionally <b>create a template.</b>` },
	{ text: `<video src="./img/help/intro/store-create-new-type.mp4" preload controls class="full" />` },
	{ style: I.TextStyle.Header1, text: `Sets` },
	{ text: `Bring multiple objects into one view with Sets. You can make a Set for a specific type of object, like seeing every task in one view. Inside a Set, you can sort, filter and choose a view.` },
	{ text: `<img src="./img/help/intro/0c62976fba4a5a656c763bc8f4827ffe.png" class="full" />` },
	{ text: `Sets don't <b>store</b> objects. They are a way to see a portion of your knowledge graph, like objects tagged <kbd>Work</kbd>. Sets help you sort through, and create specific views to work with many objects at once.` },
	{ style: I.TextStyle.Header3, text: `<b>Creating Sets</b>` },
	{ text: `From the Library, choose an object type, click "Create", and choose "Create a set".` },
	{ text: `<video src="./img/help/intro/store-create-new-set.mp4" preload controls class="full" />` },
	{ text: `<i>Read about <a href="https://community.anytype.io/d/942-how-can-i-create-a-task-tracker">how can you create a task tracker</a>.</i> ` },
	{ style: I.TextStyle.Header1, text: `Templates` },
	{ text: `Templates are a great way to get started with new objects. You can create a template from scratch or use one already included with Anytype` },
	{ text: `Existing objects can be turned into templates using the <b>···</b> button. They will be available during the creation of object having this type.` },
	{ text: `<img src="./img/help/intro/438eb7b559abca855553778d41ab29fd.png" class="full" />` },
	{ text: `Types support multiple templates, so you could, for example, have templates for different tasks or systems like GTD and OKRs. Or different templates for different kinds of book, like academic, fiction, non-fiction. You can manage them in Type they belong to:` },
	{ text: `<video src="./img/help/intro/store-create-new-template.mp4" preload controls class="full" />` },
	{ text: `<b>Current template options:</b>` },
	{ style: I.TextStyle.Bulleted, text: `Choosing the layout.` },
	{ style: I.TextStyle.Bulleted, text: `Basic, profile, or action.` },
	{ style: I.TextStyle.Bulleted, text: `Featured relations.` },
	{ style: I.TextStyle.Bulleted, text: `Canvas blocks to build a visual structure.` },
	{ style: I.TextStyle.Header1, text: `Summary` },
	{ text: `This is the very first version of Anytype. An encrypted, offline-first tool for thought with robust sync on mobile and desktop. In the coming months we will release full support on iOS, Graph view, dark mode, and local APIs.` },
	{ style: I.TextStyle.Header1, text: `Problems and feature requests` },
	{ text: `If you experience any problems, please, get in touch with us in the forum. You can make a bug report, feature request, or ask questions there. You can also join our telegram and discord groups for chatting with other Anytypers.` },
	{ text: `If you see any problems with synchronisation, not responding app, high resource consumption, please open <a href="https://community.anytype.io/d/675-sync-problems-white-screen-or-not-responding-high-resource-consumption/5">this thread for solutions first</a>. Your Anytype's data folder is here: <a href="${path}" class="path cp bgColor bgColor-grey textColor textColor-red">${path}</a>.` },
	{ style: I.TextStyle.Header1, text: `Thank you` },
	{ text: `We still have a long way to go, but your feedback gets us there faster. Thank you for being a part of the alpha program, and thank you for being part of this journey.` },
	{ text: `— Anton, Roman, Zhanna & the entire Anyteam.` },
];
