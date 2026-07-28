__ZNK26FFDestAnalyzerSynchronizer18lockTracker_directEv:
00000000013218c0	pushq	%rbp
00000000013218c1	movq	%rsp, %rbp
00000000013218c4	pushq	%rbx
00000000013218c5	pushq	%rax
00000000013218c6	movq	%rdi, %rbx
00000000013218c9	addq	$0x10, %rdi
00000000013218cd	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000013218d2	lock
00000000013218d3	incl	0x134(%rbx)
00000000013218d9	addq	$0x8, %rsp
00000000013218dd	popq	%rbx
00000000013218de	popq	%rbp
00000000013218df	retq
