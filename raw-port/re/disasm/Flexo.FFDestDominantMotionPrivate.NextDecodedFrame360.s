__ZN27FFDestDominantMotionPrivate19NextDecodedFrame360EiP5HGRefI8HGBitmapEPv:
0000000001360e70	pushq	%rbp
0000000001360e71	movq	%rsp, %rbp
0000000001360e74	pushq	%r15
0000000001360e76	pushq	%r14
0000000001360e78	pushq	%rbx
0000000001360e79	pushq	%rax
0000000001360e7a	movq	%rdx, %rbx
0000000001360e7d	movq	%rsi, %r14
0000000001360e80	movq	0x58c519(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000001360e87	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000001360e8c	movq	%rax, %r15
0000000001360e8f	movq	0x8a0a7a(%rip), %rsi
0000000001360e96	movq	%rbx, %rdi
0000000001360e99	xorl	%edx, %edx
0000000001360e9b	movq	%r14, %rcx
0000000001360e9e	callq	*0x58c81c(%rip)                 ## Objc message: -[%rdi arranged]
0000000001360ea4	movl	%eax, %ebx
0000000001360ea6	movq	%r15, %rdi
0000000001360ea9	callq	*0x58c859(%rip)                 ## literal pool symbol address: _objc_release
0000000001360eaf	movl	%ebx, %eax
0000000001360eb1	addq	$0x8, %rsp
0000000001360eb5	popq	%rbx
0000000001360eb6	popq	%r14
0000000001360eb8	popq	%r15
0000000001360eba	popq	%rbp
0000000001360ebb	retq
0000000001360ebc	nopl	(%rax)
