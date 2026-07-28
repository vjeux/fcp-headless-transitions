__ZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEv:
00000000012518b0	cmpq	$-0x1, __ZZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEvE10sPredicate(%rip) ## STBuiltinAudioUnitsRegistrar::sharedInstance()::sPredicate
00000000012518b8	jne	0x12518c2
00000000012518ba	movq	__ZZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEvE9sInstance(%rip), %rax ## STBuiltinAudioUnitsRegistrar::sharedInstance()::sInstance
00000000012518c1	retq
00000000012518c2	pushq	%rbp
00000000012518c3	movq	%rsp, %rbp
00000000012518c6	callq	____ZN19STBuiltinAudioUnits8DescribeEj_block_invoke.cold.1
00000000012518cb	popq	%rbp
00000000012518cc	movq	__ZZN28STBuiltinAudioUnitsRegistrar14sharedInstanceEvE9sInstance(%rip), %rax ## STBuiltinAudioUnitsRegistrar::sharedInstance()::sInstance
00000000012518d3	retq
00000000012518d4	nopw	%cs:(%rax,%rax)
