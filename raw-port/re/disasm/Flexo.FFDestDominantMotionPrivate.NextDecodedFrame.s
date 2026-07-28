__ZN27FFDestDominantMotionPrivate16NextDecodedFrameEiPPvS0_:
0000000001360d60	pushq	%rbp
0000000001360d61	movq	%rsp, %rbp
0000000001360d64	pushq	%r15
0000000001360d66	pushq	%r14
0000000001360d68	pushq	%rbx
0000000001360d69	pushq	%rax
0000000001360d6a	movq	%rdx, %rbx
0000000001360d6d	movq	%rsi, %r14
0000000001360d70	movq	0x58c629(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000001360d77	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000001360d7c	movq	%rax, %r15
0000000001360d7f	movq	0x8a0b8a(%rip), %rsi
0000000001360d86	movq	%rbx, %rdi
0000000001360d89	movq	%r14, %rdx
0000000001360d8c	xorl	%ecx, %ecx
0000000001360d8e	callq	*0x58c92c(%rip)                 ## Objc message: -[%rdi arranged]
0000000001360d94	movl	%eax, %ebx
0000000001360d96	movq	%r15, %rdi
0000000001360d99	callq	*0x58c969(%rip)                 ## literal pool symbol address: _objc_release
0000000001360d9f	movl	%ebx, %eax
0000000001360da1	addq	$0x8, %rsp
0000000001360da5	popq	%rbx
0000000001360da6	popq	%r14
0000000001360da8	popq	%r15
0000000001360daa	popq	%rbp
0000000001360dab	retq
0000000001360dac	nopl	(%rax)
