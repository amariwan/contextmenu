const createContextMenu = (elIdOrEl, menuStructure) => {
	let targetElement;
	if (typeof elIdOrEl == 'object') {
		targetElement = elIdOrEl;
	} else if (typeof elIdOrEl == 'string') {
		targetElement = document.getElementById(elIdOrEl);
	} else {
		targetElement = document.body;
	}
	const menuElement = document.createElement('menu');
	menuElement.className = 'menu blur';
	let menuItemElement;
	const submenuListElements = [];
	const submenuListLevels = [];

	const createMenu = (menuItems, parentElement, level = 0) => {
		const items = menuItems.list || menuItems;
		menuItemElement = document.createElement('li');
		menuItemElement.className = 'menu-item';
		parentElement.appendChild(menuItemElement);
		if (typeof items.label === 'string') {
			if (items.submenu) return menuItemElement.appendChild(createSubItem(items, level));
			return menuItemElement.appendChild(createItem(items));
		}
		items.forEach((menuItem) => {
			if (menuItem.submenu) {
				menuItemElement.appendChild(createSubItem(menuItem, level));
			} else {
				menuItemElement.appendChild(createItem(menuItem));
			}
		});
	};

	const createItem = (items) => {
		const menuItemButtonElement = document.createElement('button');
		menuItemButtonElement.className = 'menu-button  ' + items.style;
		const iconElement = document.createElement('i');
		iconElement.setAttribute('data-icon', items.icon);
		menuItemButtonElement.appendChild(iconElement);
		const labelElement = document.createElement('span');
		labelElement.textContent = items.label;
		menuItemButtonElement.appendChild(labelElement);
		menuItemButtonElement.addEventListener('click', () => {
			if (menuElement && menuElement.parentNode) {
				menuElement.parentNode.removeChild(menuElement);
			}
			items.action();
		});
		return menuItemButtonElement;
	};

	const createSubItem = (menuItem, level = 0) => {
		const submenuButtonElement = document.createElement('button');
		submenuButtonElement.className = 'menu-button ' + menuItem.style;
		const iconElement = document.createElement('i');
		iconElement.setAttribute('data-icon', menuItem.icon);

		submenuButtonElement.appendChild(iconElement);
		const labelElement = document.createElement('span');
		labelElement.textContent = menuItem.label;
		submenuButtonElement.appendChild(labelElement);
		const iconElementRight = document.createElement('i');
		iconElementRight.setAttribute('data-icon', 'chevron-right');
		submenuButtonElement.appendChild(iconElementRight);
		const submenuListElement = document.createElement('ul');
		submenuListElement.className = 'menu-sub-list ' + 'blur';
		submenuButtonElement.addEventListener('click', menuItem.action);
		menuItem.submenu.forEach((el) => {
			if (el.submenu) {
				submenuListElement.appendChild(createSubItem(el, level + 1));
			} else {
				submenuListElement.appendChild(createItem(el));
			}
		});
		submenuButtonElement.addEventListener('mouseover', (event) => {
			submenuListElement.style.display = 'flex';
		});
		submenuButtonElement.addEventListener('mouseout', (event) => {
			submenuListElement.style.display = 'none';
		});
		submenuButtonElement.appendChild(submenuListElement);
		submenuListElements.push(submenuListElement);
		submenuListLevels.push(level + 1);
		return submenuButtonElement;
	};

	menuStructure.forEach((menu) => {
		const menuList = document.createElement('ul');
		menuList.className = 'menu-list';
		menuElement.appendChild(menuList);
		createMenu(menu, menuList);
	});
	let isContextMenuOpen = false; // Variable zur Verfolgung des geöffneten Zustands des Kontextmenüs

	targetElement.addEventListener('contextmenu', (event) => {
		event.preventDefault();
		if (!isContextMenuOpen) {
			isContextMenuOpen = true;

			document.body.appendChild(menuElement);
			const { clientX, clientY } = event;
			let winWidth = window.innerWidth,
				cmWidth = menuElement.offsetWidth;

			const positionX =
				clientX + menuElement.scrollWidth >= window.innerWidth
					? window.innerWidth - menuElement.scrollWidth - 10
					: clientX;
			const positionY =
				clientY + menuElement.scrollHeight >= window.innerHeight
					? window.innerHeight - menuElement.scrollHeight - 20
					: clientY;
			menuElement.style.left = `${positionX}px`;
			menuElement.style.top = `${positionY}px`;
			menuElement.style.position = 'fixed';
			menuElement.style.zIndex = '1000';
			menuElement.style.padding = '0px';
			tasio.replace();

			submenuListElements.forEach((submenuListElement, i) => {
				let currentLevel = submenuListLevels[i];
				let offsetX = cmWidth * currentLevel;
				let availableWidth = winWidth - clientX;
				if (availableWidth < offsetX + submenuListElement.parentElement.clientWidth) {
					submenuListElement.style.left = '-150px';
				} else {
					submenuListElement.style.left = '';
					submenuListElement.style.right = '-200px';
				}
			});
		} else {
			isContextMenuOpen = false;
			if (menuElement && menuElement.parentNode) {
				menuElement.parentNode.removeChild(menuElement);
			}
		}
	});

	let touchTimer;

	targetElement.addEventListener('touchstart', handleTouchStart);
	targetElement.addEventListener('touchend', handleTouchEnd);

	function handleTouchStart(event) {
		touchTimer = setTimeout(() => {
			if (!isContextMenuOpen) {
				isContextMenuOpen = true; // Kontextmenü ist geöffnet
				event.preventDefault();
				document.body.appendChild(menuElement);

				// Get the touch position
				const { clientX, clientY } = event.touches[0];

				// Calculate the available window width and context menu width
				let winWidth = window.innerWidth;
				let cmWidth = menuElement.offsetWidth;

				// Calculate the X position for the context menu
				const positionX =
					clientX + menuElement.scrollWidth >= winWidth
						? winWidth - menuElement.scrollWidth - 10
						: clientX;

				// Calculate the Y position for the context menu
				const positionY =
					clientY + menuElement.scrollHeight >= window.innerHeight
						? window.innerHeight - menuElement.scrollHeight - 20
						: clientY;

				// Set the position and styling of the context menu
				menuElement.style.left = `${positionX}px`;
				menuElement.style.top = `${positionY}px`;
				menuElement.style.position = 'fixed';
				menuElement.style.zIndex = '1000';
				menuElement.style.padding = '0px';

				// Perform any necessary replacements or modifications
				tasio.replace();

				// Position submenu list elements
				submenuListElements.forEach((submenuListElement, i) => {
					let currentLevel = submenuListLevels[i];
					let offsetX = cmWidth * currentLevel;
					let availableWidth = winWidth - clientX;

					if (availableWidth < offsetX + submenuListElement.parentElement.clientWidth) {
						submenuListElement.style.left = '-200px';
					} else {
						submenuListElement.style.left = '';
						submenuListElement.style.right = '-200px';
					}
				});
			} else {
				isContextMenuOpen = false; // Kontextmenü ist geschlossen
				if (menuElement && menuElement.parentNode) {
					menuElement.parentNode.removeChild(menuElement);
				}
			}
		}, 500); // Adjust the duration of the long press as needed
	}

	function handleTouchEnd(event) {
		clearTimeout(touchTimer);
	}

	document.addEventListener('click', () => {
		if (isTouchDevice()) {
			clearTimeout(touchTimer);
		} else {
			if (menuElement && menuElement.parentNode) {
				menuElement.parentNode.removeChild(menuElement);
			}
		}
	});
	const isTouchDevice = () => {
		return (
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			navigator.msMaxTouchPoints > 0
		);
	};

	return menuElement;
};

// example
// const menuStructure_ = [
// 	{
// 		label: 'File',
// 		list: [
// 			{
// 				label: 'New',
// 				icon: 'file-plus',
// 				action: () => {
// 					console.log('New');
// 				},
// 			},
// 			{
// 				label: 'Open',
// 				icon: 'folder-plus',
// 				action: () => {
// 					console.log('Open');
// 				},
// 			},
// 			{
// 				label: 'Save',
// 				icon: 'save',
// 				action: () => {
// 					console.log('Save');
// 				},
// 				submenu: [
// 					{
// 						label: 'Save',
// 						icon: 'save',
// 						action: () =>
// 						{
// 							console.log('Save');
// 						},
// 					},
// 					{
// 						label: 'Save As',
// 						icon: 'save',
// 						action: () =>
// 						{
// 							console.log('Save As');
// 						},
// 					},
// 					{
// 						label: 'Print',
// 						icon: 'printer',
// 						action: () =>
// 						{
// 							console.log('Print');
// 						},
// 						submenu: [
// 							{
// 								label: 'Print page',
// 								icon: 'printer',
// 								action: () =>
// 								{
// 									console.log('Print page');
// 								}
// 							},
// 							{
// 								label: 'Print all',
// 								icon: 'printer',
// 								action: () =>
// 								{
// 									console.log('Print all');
// 								},
// 								submenu: [
// 									{
// 										label: 'Print page',
// 										icon: 'printer',
// 										action: () =>
// 										{
// 											console.log('Print page');
// 										}
// 									}
// 								]
// 							}
// 						]
// 					}
// 				]
// 			},
// 			{
// 				label: 'Exit',
// 				icon: 'x',
// 				action: () => {
// 					console.log('Exit');
// 				},
// 			},
// 		],
// 	},
// 	{
// 		label: 'Edit',
// 		list: [
// 			{
// 				label: 'Undo',
// 				icon: 'rotate-ccw',
// 				action: () => {
// 					console.log('Undo');
// 				},
// 			},
// 			{
// 				label: 'Redo',
// 				icon: 'rotate-cw',
// 				action: () => {
// 					console.log('Redo');
// 				},
// 			},
// 			{
// 				label: 'Cut',
// 				icon: 'scissors',
// 				action: () => {
// 					console.log('Cut');
// 				},
// 			},
// 			{
// 				label: 'Copy',
// 				icon: 'copy',
// 				action: () => {
// 					console.log('Copy');
// 				},
// 			},
// 			{
// 				label: 'Paste',
// 				icon: 'clipboard',
// 				action: () => {
// 					console.log('Paste');
// 				},
// 			},
// 			{
// 				label: 'Delete',
// 				icon: 'trash-2',
// 				action: () => {
// 					console.log('Delete');
// 				},
// 			},
// 		],
// 	},
// 	{
// 		label: 'View',
// 		list: [
// 			{
// 				label: 'Zoom In',
// 				icon: 'zoom-in',
// 				action: () => {
// 					console.log('Zoom In');
// 				},
// 			},
// 			{
// 				label: 'Zoom Out',
// 				icon: 'zoom-out',
// 				action: () => {
// 					console.log('Zoom Out');
// 				},
// 			},
// 			{
// 				label: 'Zoom Reset',
// 				icon: 'refresh-cw',
// 				action: () => {
// 					console.log('Zoom Reset');
// 				},
// 			},
// 		],
// 	},
// 	{
// 		label: 'Help',
// 		list: [
// 			{
// 				label: 'About',
// 				icon: 'info',
// 				action: () => {
// 					console.log('About');
// 				},
// 			},
// 		],
// 	},
// ];

// createContextMenu(menuStructure_, 'header_index');
