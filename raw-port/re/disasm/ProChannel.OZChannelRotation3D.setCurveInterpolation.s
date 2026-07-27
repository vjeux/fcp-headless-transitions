__ZN19OZChannelRotation3D21setCurveInterpolationEj:
0000000000081738	pushq	%rbp
0000000000081739	movq	%rsp, %rbp
000000000008173c	pushq	%r14
000000000008173e	pushq	%rbx
000000000008173f	movl	%esi, %ebx
0000000000081741	movq	%rdi, %r14
0000000000081744	movq	(%rdi), %rax
0000000000081747	xorl	%esi, %esi
0000000000081749	callq	*0x328(%rax)
000000000008174f	leaq	0x88(%r14), %rdi
0000000000081756	movl	%ebx, %esi
0000000000081758	callq	__ZN9OZChannel16setInterpolationEj ## OZChannel::setInterpolation(unsigned int)
000000000008175d	leaq	0x120(%r14), %rdi
0000000000081764	movl	%ebx, %esi
0000000000081766	callq	__ZN9OZChannel16setInterpolationEj ## OZChannel::setInterpolation(unsigned int)
000000000008176b	addq	$0x1b8, %r14                    ## imm = 0x1B8
0000000000081772	movq	%r14, %rdi
0000000000081775	movl	%ebx, %esi
0000000000081777	popq	%rbx
0000000000081778	popq	%r14
000000000008177a	popq	%rbp
000000000008177b	jmp	__ZN9OZChannel16setInterpolationEj ## OZChannel::setInterpolation(unsigned int)
