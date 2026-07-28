__ZN13HgcApply1DLUT12SetParameterEiffff:
0000000000024fc0	cmpl	$0x2, %esi
0000000000024fc3	ja	0x24fef
0000000000024fc5	movl	%esi, %eax
0000000000024fc7	shlq	$0x4, %rax
0000000000024fcb	movss	%xmm0, 0x1a0(%rdi,%rax)
0000000000024fd4	movss	%xmm1, 0x1a4(%rdi,%rax)
0000000000024fdd	movss	%xmm2, 0x1a8(%rdi,%rax)
0000000000024fe6	movss	%xmm3, 0x1ac(%rdi,%rax)
0000000000024fef	pushq	%rbp
0000000000024ff0	movq	%rsp, %rbp
0000000000024ff3	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000024ff8	movl	$0x1, %eax
0000000000024ffd	popq	%rbp
0000000000024ffe	retq
0000000000024fff	nop
