__ZN23HGBilateralFilterInterp14SetRangeOffsetEf:
00000000001091f0	pushq	%rbp
00000000001091f1	movq	%rsp, %rbp
00000000001091f4	pushq	%rbx
00000000001091f5	pushq	%rax
00000000001091f6	movss	%xmm0, -0xc(%rbp)
00000000001091fb	movq	%rdi, %rbx
00000000001091fe	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000109203	movss	-0xc(%rbp), %xmm0
0000000000109208	movss	%xmm0, 0x1dc(%rbx)
0000000000109210	addq	$0x8, %rsp
0000000000109214	popq	%rbx
0000000000109215	popq	%rbp
0000000000109216	retq
0000000000109217	nopw	(%rax,%rax)
