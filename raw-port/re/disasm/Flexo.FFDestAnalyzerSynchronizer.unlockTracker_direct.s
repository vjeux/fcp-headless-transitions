__ZNK26FFDestAnalyzerSynchronizer20unlockTracker_directEv:
00000000013218e0	pushq	%rbp
00000000013218e1	movq	%rsp, %rbp
00000000013218e4	lock
00000000013218e5	decl	0x134(%rdi)
00000000013218eb	addq	$0x10, %rdi
00000000013218ef	popq	%rbp
00000000013218f0	jmp	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000013218f5	nopw	%cs:(%rax,%rax)
