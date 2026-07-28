__ZN17FFAudioKillThread10killThreadEv:
0000000000d0af30	pushq	%rbp
0000000000d0af31	movq	%rsp, %rbp
0000000000d0af34	pushq	%r14
0000000000d0af36	pushq	%rbx
0000000000d0af37	subq	$0x10, %rsp
0000000000d0af3b	movq	__ZN17FFAudioKillThread14s_instanceLockE(%rip), %rsi ## FFAudioKillThread::s_instanceLock
0000000000d0af42	leaq	-0x20(%rbp), %r14
0000000000d0af46	movq	%r14, %rdi
0000000000d0af49	xorl	%edx, %edx
0000000000d0af4b	callq	__ZN8FFLockerC1EP10FFLockBaseNS_8LockTypeE ## FFLocker::FFLocker(FFLockBase*, FFLocker::LockType)
0000000000d0af50	movq	__ZN17FFAudioKillThread10s_instanceE(%rip), %rbx ## FFAudioKillThread::s_instance
0000000000d0af57	movq	$0x0, __ZN17FFAudioKillThread10s_instanceE(%rip) ## FFAudioKillThread::s_instance
0000000000d0af62	movq	%r14, %rdi
0000000000d0af65	callq	__ZN8FFLockerD1Ev               ## FFLocker::~FFLocker()
0000000000d0af6a	testq	%rbx, %rbx
0000000000d0af6d	je	0xd0af78
0000000000d0af6f	movq	(%rbx), %rax
0000000000d0af72	movq	%rbx, %rdi
0000000000d0af75	callq	*0x8(%rax)
0000000000d0af78	addq	$0x10, %rsp
0000000000d0af7c	popq	%rbx
0000000000d0af7d	popq	%r14
0000000000d0af7f	popq	%rbp
0000000000d0af80	retq
0000000000d0af81	nopw	%cs:(%rax,%rax)
