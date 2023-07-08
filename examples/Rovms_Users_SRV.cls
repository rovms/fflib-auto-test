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
