__ZN16HGYUVPlanarTo444C1EN11HGYUVPlanar11SubSamplingEb:
00000000000e53a0	pushq	%rbp
00000000000e53a1	movq	%rsp, %rbp
00000000000e53a4	pushq	%r15
00000000000e53a6	pushq	%r14
00000000000e53a8	pushq	%rbx
00000000000e53a9	pushq	%rax
00000000000e53aa	movl	%edx, %ebx
00000000000e53ac	movl	%esi, %r14d
00000000000e53af	movq	%rdi, %r15
00000000000e53b2	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000e53b7	leaq	0x92905a(%rip), %rax
00000000000e53be	movq	%rax, (%r15)
00000000000e53c1	movq	$0x0, 0x198(%r15)
00000000000e53cc	movl	%r14d, 0x1a0(%r15)
00000000000e53d3	movq	$0x3, 0x1a4(%r15)
00000000000e53de	movb	%bl, 0x1ac(%r15)
00000000000e53e5	movl	$0x0, 0x1b0(%r15)
00000000000e53f0	addq	$0x8, %rsp
00000000000e53f4	popq	%rbx
00000000000e53f5	popq	%r14
00000000000e53f7	popq	%r15
00000000000e53f9	popq	%rbp
00000000000e53fa	retq
00000000000e53fb	nopl	(%rax,%rax)
