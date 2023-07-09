**FFLIB AUTO TEST**

A simple CLI to create a test method skeleton for passed methods that were written with the https://github.com/apex-enterprise-patterns/fflib-apex-common & https://github.com/apex-enterprise-patterns/fflib-apex-mocks framework.

**Assumptions**

The naming convention of the class names for which this tool was developed follows the `ProjectName_ObjectPlural_ClassType` pattern. So, for example `Rovms_Users_SRV` where `Rovms` is the project name, `Users` the plural of the User object and `SRV` denoting the fact that the class in question is a service class. Selector classes are detected when suffixed with `_SEL` and Domain classes when suffixed with `_DOM`.

If you are using a different naming convention, please raise a PR or let me know about it and we'll add it as a configuration possibility. This is very much still a first beta version.

**Example**

In order to produce a test method skeleton for the method `randomMethod` in class `Rovms_Opportunities_SRV`:

```
public class Rovms_Users_SRV {
	public static IService newInstance() {
		return (Rovms_Users_SRV) Rovms_Application_UTIL.service.newInstance(Rovms_Users_SRV.class);
	}

	public interface IService {
		void randomMethod(Set<Id> userIds);
	}

	public void randomMethod(Set<Id> userIds) {
		fflib_ISObjectUnitOfWork uow = Rovms_Application_UTIL.unitOfWork.newInstance();

		List<User> users = Rovms_Users_SEL.newInstance().selectByIds(userIds);

		List<Contact> contacts = Rovms_Contacts_SEL.newInstance().selectBest100();
		Rovms_Contacts_DOM.newInstance(contacts).assignBestContacts(uow, users);

		Map<String, User> firstNameToUser = Rovms_Users_DOM.newInstance(users).getFirstNameToUser();
		Rovms_Users_SRV.newInstance().refresh(firstNameToUser);

		uow.commitWork();
	}
}
```

Running:

`fflib-auto-test examples/Rovms_Opportunities_SRV.cls randomMethod`

produces something like:

```
@isTest
private static void randomMethod_test() {
// Set up mocks
fflib_ApexMocks mocks = new fflib_ApexMocks();
fflib_ISObjectUnitOfWork uowMock = new fflib_SObjectMocks.SObjectUnitOfWork(mocks);
Rovms_Users_SEL userSelectorMock = (Rovms_Users_SEL) mocks.mock(Rovms_Users_SEL.class);
Rovms_Contacts_SEL contactSelectorMock = (Rovms_Contacts_SEL) mocks.mock(Rovms_Contacts_SEL.class);

// Given
// -- SETUP DATA (MOCKED) HERE --


// Set Mocks
mocks.startStubbing();
mocks.when(userSelectorMock.sObjectType()).thenReturn(User.getSObjectType());
mocks.when(userSelectorMock.selectByIds(-- ARGS --)).thenReturn(-- RET ARGS --);
mocks.when(contactSelectorMock.sObjectType()).thenReturn(Contact.getSObjectType());
mocks.when(contactSelectorMock.selectBest100(-- ARGS --)).thenReturn(-- RET ARGS --);
mocks.when(contactDomainMock.sObjectType()).thenReturn(Contact.getSObjectType());
mocks.when(contactDomainMock.assignBestContacts(-- ARGS --)).thenReturn(-- RET ARGS --);
mocks.when(userDomainMock.sObjectType()).thenReturn(User.getSObjectType());
mocks.when(userDomainMock.getFirstNameToUser(-- ARGS --)).thenReturn(-- RET ARGS --);
mocks.when(userServiceMock.sObjectType()).thenReturn(User.getSObjectType());
mocks.when(userServiceMock.refresh(-- ARGS --)).thenReturn(-- RET ARGS --);
mocks.stopStubbing();

Rovms_Application_UTIL.selector.setMock(userSelectorMock);
Rovms_Application_UTIL.selector.setMock(contactSelectorMock);
Rovms_Application_UTIL.domain.setMock(contactDomainMock);
Rovms_Application_UTIL.domain.setMock(userDomainMock);
Rovms_Application_UTIL.service.setMock(Rovms_Users_SRV.class, userServiceMock);

// When
Rovms_Users_SRV.newInstance().randomMethod(-- ARGS --);

// Then
//-- VERIFY TEST RESULTS --

}
```

This part is output in the console and can be copy-pasted into the desired test class.

Mock data, method arguments and test assertions have to be done manually (for now).
