__ZN19STBuiltinAudioUnits17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj:
0000000001251c40	pushq	%rbp
0000000001251c41	movq	%rsp, %rbp
0000000001251c44	pushq	%r14
0000000001251c46	pushq	%rbx
0000000001251c47	movl	%esi, %edx
0000000001251c49	movq	%rdi, %rbx
0000000001251c4c	cmpq	$-0x1, __ZZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEvE10sPredicate(%rip) ## STBuiltinAudioUnitsRegistrar::sharedInstance()::sPredicate
0000000001251c54	jne	0x1251c6c
0000000001251c56	movq	__ZZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEvE9sInstance(%rip), %rdi ## STBuiltinAudioUnitsRegistrar::sharedInstance()::sInstance
0000000001251c5d	movq	%rbx, %rsi
0000000001251c60	callq	__ZN28STBuiltinAudioUnitsRegistrar17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj ## STBuiltinAudioUnitsRegistrar::DeferRegistration(AudioComponentPlugInInterface* (*)(AudioComponentDescription const*), unsigned int)
0000000001251c65	movb	$0x1, %al
0000000001251c67	popq	%rbx
0000000001251c68	popq	%r14
0000000001251c6a	popq	%rbp
0000000001251c6b	retq
0000000001251c6c	movl	%edx, %r14d
0000000001251c6f	callq	__ZN19STBuiltinAudioUnits17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj.cold.1 ## STBuiltinAudioUnits::DeferRegistration(AudioComponentPlugInInterface* (*)(AudioComponentDescription const*), unsigned int) (.cold.1)
0000000001251c74	movl	%r14d, %edx
0000000001251c77	jmp	0x1251c56
0000000001251c79	nopl	(%rax)
