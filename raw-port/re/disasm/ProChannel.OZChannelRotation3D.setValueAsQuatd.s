__ZN19OZChannelRotation3D15setValueAsQuatdERK6PCQuatIdERK6CMTime:
0000000000082288	pushq	%rbp
0000000000082289	movq	%rsp, %rbp
000000000008228c	pushq	%r15
000000000008228e	pushq	%r14
0000000000082290	pushq	%r13
0000000000082292	pushq	%r12
0000000000082294	pushq	%rbx
0000000000082295	subq	$0x28, %rsp
0000000000082299	movq	%rdx, %rbx
000000000008229c	movq	%rsi, -0x40(%rbp)
00000000000822a0	movq	%rdi, %r14
00000000000822a3	addq	$0x88, %rdi
00000000000822aa	movq	%rdi, -0x38(%rbp)
00000000000822ae	xorps	%xmm0, %xmm0
00000000000822b1	movq	%rdx, %rsi
00000000000822b4	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000822b9	leaq	-0x50(%rbp), %r15
00000000000822bd	movsd	%xmm0, (%r15)
00000000000822c2	leaq	0x120(%r14), %r12
00000000000822c9	xorps	%xmm0, %xmm0
00000000000822cc	movq	%r12, %rdi
00000000000822cf	movq	%rbx, %rsi
00000000000822d2	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000822d7	leaq	-0x30(%rbp), %rax
00000000000822db	movsd	%xmm0, (%rax)
00000000000822df	leaq	0x1b8(%r14), %r13
00000000000822e6	xorps	%xmm0, %xmm0
00000000000822e9	movq	%r13, %rdi
00000000000822ec	movq	%rbx, %rsi
00000000000822ef	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000822f4	leaq	-0x48(%rbp), %rcx
00000000000822f8	movsd	%xmm0, (%rcx)
00000000000822fc	movq	-0x40(%rbp), %rdi
0000000000082300	movq	%r15, %rsi
0000000000082303	leaq	-0x30(%rbp), %rdx
0000000000082307	movl	$0x4, %r8d
000000000008230d	callq	__ZNK6PCQuatIdE25getIncrementalEulerAnglesEPdS1_S1_13RotationOrder ## PCQuat<double>::getIncrementalEulerAngles(double*, double*, double*, RotationOrder) const
0000000000082312	movsd	(%r15), %xmm0
0000000000082317	movq	0x88(%r14), %rax
000000000008231e	movq	-0x38(%rbp), %rdi
0000000000082322	movq	%rbx, %rsi
0000000000082325	xorl	%edx, %edx
0000000000082327	callq	*0x2c8(%rax)
000000000008232d	leaq	-0x30(%rbp), %rax
0000000000082331	movsd	(%rax), %xmm0
0000000000082335	movq	0x120(%r14), %rax
000000000008233c	movq	%r12, %rdi
000000000008233f	movq	%rbx, %rsi
0000000000082342	xorl	%edx, %edx
0000000000082344	callq	*0x2c8(%rax)
000000000008234a	leaq	-0x48(%rbp), %rax
000000000008234e	movsd	(%rax), %xmm0
0000000000082352	movq	0x1b8(%r14), %rax
0000000000082359	movq	%r13, %rdi
000000000008235c	movq	%rbx, %rsi
000000000008235f	xorl	%edx, %edx
0000000000082361	callq	*0x2c8(%rax)
0000000000082367	addq	$0x28, %rsp
000000000008236b	popq	%rbx
000000000008236c	popq	%r12
000000000008236e	popq	%r13
0000000000082370	popq	%r14
0000000000082372	popq	%r15
0000000000082374	popq	%rbp
0000000000082375	retq
