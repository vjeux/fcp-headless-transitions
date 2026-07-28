__ZN17FFAudioKillThread11addKillTaskEP21FFAudioKillThreadTask:
0000000000d0af90	pushq	%rbp
0000000000d0af91	movq	%rsp, %rbp
0000000000d0af94	pushq	%rbx
0000000000d0af95	subq	$0x18, %rsp
0000000000d0af99	movq	%rdi, %rbx
0000000000d0af9c	movq	__ZN17FFAudioKillThread14s_instanceLockE(%rip), %rsi ## FFAudioKillThread::s_instanceLock
0000000000d0afa3	leaq	-0x18(%rbp), %rdi
0000000000d0afa7	xorl	%edx, %edx
0000000000d0afa9	callq	__ZN8FFLockerC1EP10FFLockBaseNS_8LockTypeE ## FFLocker::FFLocker(FFLockBase*, FFLocker::LockType)
0000000000d0afae	cmpq	$-0x1, __ZZN17FFAudioKillThread8instanceEvE9predicate(%rip) ## FFAudioKillThread::instance()::predicate
0000000000d0afb6	jne	0xd0afdc
0000000000d0afb8	movq	__ZN17FFAudioKillThread10s_instanceE(%rip), %rdi ## FFAudioKillThread::s_instance
0000000000d0afbf	testq	%rdi, %rdi
0000000000d0afc2	je	0xd0afed
0000000000d0afc4	movq	%rbx, %rsi
0000000000d0afc7	callq	__ZN12WorkerThread7addTaskEPNS_4TaskE ## WorkerThread::addTask(WorkerThread::Task*)
0000000000d0afcc	leaq	-0x18(%rbp), %rdi
0000000000d0afd0	callq	__ZN8FFLockerD1Ev               ## FFLocker::~FFLocker()
0000000000d0afd5	addq	$0x18, %rsp
0000000000d0afd9	popq	%rbx
0000000000d0afda	popq	%rbp
0000000000d0afdb	retq
0000000000d0afdc	callq	__ZN17FFAudioKillThread11addKillTaskEP21FFAudioKillThreadTask.cold.1 ## FFAudioKillThread::addKillTask(FFAudioKillThreadTask*) (.cold.1)
0000000000d0afe1	movq	__ZN17FFAudioKillThread10s_instanceE(%rip), %rdi ## FFAudioKillThread::s_instance
0000000000d0afe8	testq	%rdi, %rdi
0000000000d0afeb	jne	0xd0afc4
0000000000d0afed	leaq	-0x18(%rbp), %rdi
0000000000d0aff1	callq	__ZN8FFLockerD1Ev               ## FFLocker::~FFLocker()
0000000000d0aff6	movq	(%rbx), %rax
0000000000d0aff9	movq	%rbx, %rdi
0000000000d0affc	callq	*0x10(%rax)
0000000000d0afff	movq	(%rbx), %rax
0000000000d0b002	movq	%rbx, %rdi
0000000000d0b005	callq	*0x28(%rax)
0000000000d0b008	addq	$0x18, %rsp
0000000000d0b00c	popq	%rbx
0000000000d0b00d	popq	%rbp
0000000000d0b00e	retq
0000000000d0b00f	movq	%rax, %rbx
0000000000d0b012	leaq	-0x18(%rbp), %rdi
0000000000d0b016	callq	__ZN8FFLockerD1Ev               ## FFLocker::~FFLocker()
0000000000d0b01b	movq	%rbx, %rdi
0000000000d0b01e	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d0b023	nopw	%cs:(%rax,%rax)
