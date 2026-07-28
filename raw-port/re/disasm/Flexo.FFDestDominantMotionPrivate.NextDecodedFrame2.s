__ZN27FFDestDominantMotionPrivate17NextDecodedFrame2EiPPvS1_S0_:
0000000001360e10	pushq	%rbp
0000000001360e11	movq	%rsp, %rbp
0000000001360e14	pushq	%r15
0000000001360e16	pushq	%r14
0000000001360e18	pushq	%rbx
0000000001360e19	pushq	%rax
0000000001360e1a	movq	%rcx, %rbx
0000000001360e1d	movq	%rsi, %r14
0000000001360e20	movq	$0x0, (%rdx)
0000000001360e27	movq	0x58c572(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000001360e2e	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000001360e33	movq	%rax, %r15
0000000001360e36	movq	0x8a0ad3(%rip), %rsi
0000000001360e3d	movq	%rbx, %rdi
0000000001360e40	movq	%r14, %rdx
0000000001360e43	xorl	%ecx, %ecx
0000000001360e45	callq	*0x58c875(%rip)                 ## Objc message: -[%rdi arranged]
0000000001360e4b	movl	%eax, %ebx
0000000001360e4d	movq	%r15, %rdi
0000000001360e50	callq	*0x58c8b2(%rip)                 ## literal pool symbol address: _objc_release
0000000001360e56	movl	%ebx, %eax
0000000001360e58	addq	$0x8, %rsp
0000000001360e5c	popq	%rbx
0000000001360e5d	popq	%r14
0000000001360e5f	popq	%r15
0000000001360e61	popq	%rbp
0000000001360e62	retq
0000000001360e63	nopw	%cs:(%rax,%rax)
