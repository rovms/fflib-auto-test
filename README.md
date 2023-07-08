**FFLIB AUTO TEST**

A simple CLI to create a test method skeleton for passed methods that were written with the https://github.com/apex-enterprise-patterns/fflib-apex-common & https://github.com/apex-enterprise-patterns/fflib-apex-mocks framework.

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

ITBA_Application_UTIL.selector.setMock(Rovms_Users_SEL);
ITBA_Application_UTIL.selector.setMock(Rovms_Contacts_SEL);
ITBA_Application_UTIL.domain.setMock(Rovms_Contacts_DOM);
ITBA_Application_UTIL.domain.setMock(Rovms_Users_DOM);
ITBA_Application_UTIL.service.setMock(Rovms_Users_SRV.class, userServiceMock);

// When
Rovms_Users_SRV.newInstance().randomMethod(-- ARGS --);

// Then
//-- VERIFY TEST RESULTS --

}
```

This part is output in the console and can be copy-pasted into the desired test class.

Mock data, method arguments and test assertions have to be done manually (for now).

**Config options**

Run `todo`

to change configuration.

Whether to use singular or plural mode to infer object names from class names:

`-nm singular` or `-nm s` or `-nm plural` or `-nm p`. Also possible to use `--nounMode` instead of `-nm`.
