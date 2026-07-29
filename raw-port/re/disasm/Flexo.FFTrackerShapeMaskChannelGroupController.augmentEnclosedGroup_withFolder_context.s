-[FFTrackerShapeMaskChannelGroupController augmentEnclosedGroup:withFolder:context:]:
000000000064abe0	pushq	%rbp
000000000064abe1	movq	%rsp, %rbp
000000000064abe4	pushq	%r15
000000000064abe6	pushq	%r14
000000000064abe8	pushq	%r12
000000000064abea	pushq	%rbx
000000000064abeb	subq	$0x10, %rsp
000000000064abef	movq	%r8, %rbx
000000000064abf2	movq	%rcx, %r12
000000000064abf5	movq	%rdx, %r14
000000000064abf8	movq	%rdi, -0x30(%rbp)
000000000064abfc	movq	0x13a68fd(%rip), %rax           ## Objc class ref: bad class ref
000000000064ac03	movq	%rax, -0x28(%rbp)
000000000064ac07	movq	0x158ac0a(%rip), %rsi
000000000064ac0e	leaq	-0x30(%rbp), %rdi
000000000064ac12	callq	0x149797a                       ## Objc message: -[[%rdi super] resizedOSCView]
000000000064ac17	movq	%rax, %r15
000000000064ac1a	movq	0x129ef97(%rip), %rsi           ## literal pool symbol address: __ZTI15OZChannelFolder
000000000064ac21	leaq	__ZTI23FFOZRiggedChannelFolder(%rip), %rdx ## typeinfo for FFOZRiggedChannelFolder
000000000064ac28	movq	%r12, %rdi
000000000064ac2b	xorl	%ecx, %ecx
000000000064ac2d	callq	0x14974b8                       ## symbol stub for: ___dynamic_cast
000000000064ac32	movq	0x80(%rax), %rdi
000000000064ac39	movq	0x158abe0(%rip), %rsi
000000000064ac40	movq	0x12a2a79(%rip), %r12           ## Objc message: -[%rdi resizedOSCView]
000000000064ac47	callq	*%r12
000000000064ac4a	movq	0x15706b7(%rip), %rsi
000000000064ac51	movq	%rax, %rdi
000000000064ac54	callq	*%r12
000000000064ac57	movq	0x1571f2a(%rip), %rsi
000000000064ac5e	movq	%r14, %rdi
000000000064ac61	movq	%rax, %rdx
000000000064ac64	movq	%rbx, %rcx
000000000064ac67	callq	*%r12
000000000064ac6a	movq	0x158abb7(%rip), %rsi
000000000064ac71	movq	%rax, %rdi
000000000064ac74	movl	$0x1, %edx
000000000064ac79	callq	*%r12
000000000064ac7c	movq	%r15, %rax
000000000064ac7f	addq	$0x10, %rsp
000000000064ac83	popq	%rbx
000000000064ac84	popq	%r12
000000000064ac86	popq	%r14
000000000064ac88	popq	%r15
000000000064ac8a	popq	%rbp
000000000064ac8b	retq
000000000064ac8c	addb	%al, (%rax)
000000000064ac8e	addb	%al, (%rax)
