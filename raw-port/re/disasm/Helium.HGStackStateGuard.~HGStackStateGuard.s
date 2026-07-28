__ZN17HGStackStateGuardD1Ev:
00000000001441b0	pushq	%rbp
00000000001441b1	movq	%rsp, %rbp
00000000001441b4	pushq	%r15
00000000001441b6	pushq	%r14
00000000001441b8	pushq	%rbx
00000000001441b9	pushq	%rax
00000000001441ba	movq	(%rdi), %rbx
00000000001441bd	movq	0x8(%rdi), %rdx
00000000001441c1	movq	0x18(%rdi), %r15
00000000001441c5	movq	0x20(%rdi), %r14
00000000001441c9	movl	0x28(%rdi), %eax
00000000001441cc	movups	0x8(%rdi), %xmm0
00000000001441d0	movups	%xmm0, 0x88(%rbx)
00000000001441d7	movl	%eax, 0x98(%rbx)
00000000001441dd	movq	%rbx, %rdi
00000000001441e0	xorl	%esi, %esi
00000000001441e2	callq	__ZN15HGExecUnitStack11rewindStackEjP11HGStackPage ## HGExecUnitStack::rewindStack(unsigned int, HGStackPage*)
00000000001441e7	movq	0x90(%rbx), %rdx
00000000001441ee	movq	%rbx, %rdi
00000000001441f1	movl	$0x1, %esi
00000000001441f6	callq	__ZN15HGExecUnitStack11rewindStackEjP11HGStackPage ## HGExecUnitStack::rewindStack(unsigned int, HGStackPage*)
00000000001441fb	movq	0x88(%rbx), %rax
0000000000144202	addq	%r15, 0x10(%rax)
0000000000144206	movq	0x90(%rbx), %rax
000000000014420d	addq	%r14, 0x10(%rax)
0000000000144211	addq	$0x8, %rsp
0000000000144215	popq	%rbx
0000000000144216	popq	%r14
0000000000144218	popq	%r15
000000000014421a	popq	%rbp
000000000014421b	retq
000000000014421c	movq	%rax, %rdi
000000000014421f	callq	___clang_call_terminate
0000000000144224	nopw	%cs:(%rax,%rax)
