__ZN13HGConvolution9SetOriginEii:
0000000000166cb0	movl	0x1a0(%rdi), %eax
0000000000166cb6	cmpl	$0x2, 0x200(%rdi)
0000000000166cbd	jl	0x166cd3
0000000000166cbf	addl	0x1c0(%rdi), %eax
0000000000166cc5	movl	0x1c4(%rdi), %ecx
0000000000166ccb	addl	0x1a4(%rdi), %ecx
0000000000166cd1	jmp	0x166cd9
0000000000166cd3	movl	0x1a4(%rdi), %ecx
0000000000166cd9	subl	%eax, %esi
0000000000166cdb	subl	%ecx, %edx
0000000000166cdd	movl	%edx, %eax
0000000000166cdf	orl	%esi, %eax
0000000000166ce1	je	0x166d19
0000000000166ce3	pushq	%rbp
0000000000166ce4	movq	%rsp, %rbp
0000000000166ce7	pushq	%rbx
0000000000166ce8	pushq	%rax
0000000000166ce9	leaq	0x198(%rdi), %rax
0000000000166cf0	movq	%rdi, %rbx
0000000000166cf3	movq	%rax, %rdi
0000000000166cf6	callq	__ZN16HGLinearFilter2D9translateEii ## HGLinearFilter2D::translate(int, int)
0000000000166cfb	movl	$0xffffffff, 0x1d8(%rbx)        ## imm = 0xFFFFFFFF
0000000000166d05	movq	%rbx, %rdi
0000000000166d08	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000166d0d	movl	$0x1, %eax
0000000000166d12	addq	$0x8, %rsp
0000000000166d16	popq	%rbx
0000000000166d17	popq	%rbp
0000000000166d18	retq
0000000000166d19	xorl	%eax, %eax
0000000000166d1b	retq
0000000000166d1c	nopl	(%rax)
