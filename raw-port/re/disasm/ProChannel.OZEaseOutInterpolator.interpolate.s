__ZN21OZEaseOutInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
000000000004390c	pushq	%rbp
000000000004390d	movq	%rsp, %rbp
0000000000043910	pushq	%r15
0000000000043912	pushq	%r14
0000000000043914	pushq	%r12
0000000000043916	pushq	%rbx
0000000000043917	subq	$0xf0, %rsp
000000000004391e	movq	%r9, %rbx
0000000000043921	movq	%r8, %r15
0000000000043924	movq	%rdx, %r12
0000000000043927	movq	%rsi, %r14
000000000004392a	movq	0x20(%rcx), %rax
000000000004392e	movq	%rax, -0x30(%rbp)
0000000000043932	movups	0x10(%rcx), %xmm0
0000000000043936	movaps	%xmm0, -0x40(%rbp)
000000000004393a	movq	0x20(%r8), %rax
000000000004393e	movq	%rax, -0x50(%rbp)
0000000000043942	movups	0x10(%r8), %xmm0
0000000000043947	movaps	%xmm0, -0x60(%rbp)
000000000004394b	movq	(%rcx), %rax
000000000004394e	movq	%rcx, %rdi
0000000000043951	movq	%rdx, %rsi
0000000000043954	callq	*0x18(%rax)
0000000000043957	movsd	%xmm0, -0x70(%rbp)
000000000004395c	movq	(%r15), %rax
000000000004395f	movq	%r15, %rdi
0000000000043962	movq	%r12, %rsi
0000000000043965	callq	*0x18(%rax)
0000000000043968	movsd	%xmm0, -0x68(%rbp)
000000000004396d	movq	-0x50(%rbp), %rax
0000000000043971	movq	%rax, 0x28(%rsp)
0000000000043976	movaps	-0x60(%rbp), %xmm0
000000000004397a	movups	%xmm0, 0x18(%rsp)
000000000004397f	movq	-0x30(%rbp), %rax
0000000000043983	movq	%rax, 0x10(%rsp)
0000000000043988	movaps	-0x40(%rbp), %xmm0
000000000004398c	movups	%xmm0, (%rsp)
0000000000043990	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043995	testl	%eax, %eax
0000000000043997	jle	0x439d7
0000000000043999	leaq	-0x90(%rbp), %r15
00000000000439a0	movq	%r15, %rdi
00000000000439a3	movq	%r14, %rsi
00000000000439a6	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
00000000000439ab	movq	0x10(%r15), %rax
00000000000439af	movq	%rax, 0x28(%rsp)
00000000000439b4	movups	(%r15), %xmm0
00000000000439b8	movups	%xmm0, 0x18(%rsp)
00000000000439bd	movq	-0x30(%rbp), %rax
00000000000439c1	movq	%rax, 0x10(%rsp)
00000000000439c6	movaps	-0x40(%rbp), %xmm0
00000000000439ca	movups	%xmm0, (%rsp)
00000000000439ce	leaq	-0x60(%rbp), %rdi
00000000000439d2	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000439d7	movq	0x10(%rbx), %rax
00000000000439db	leaq	-0x90(%rbp), %r14
00000000000439e2	movq	%rax, 0x10(%r14)
00000000000439e6	movups	(%rbx), %xmm0
00000000000439e9	movaps	%xmm0, (%r14)
00000000000439ed	movq	-0x30(%rbp), %rax
00000000000439f1	movq	%rax, 0x28(%rsp)
00000000000439f6	movaps	-0x40(%rbp), %xmm0
00000000000439fa	movups	%xmm0, 0x18(%rsp)
00000000000439ff	movq	0x10(%r14), %rax
0000000000043a03	movq	%rax, 0x10(%rsp)
0000000000043a08	movaps	(%r14), %xmm0
0000000000043a0c	movups	%xmm0, (%rsp)
0000000000043a10	leaq	-0xc0(%rbp), %rbx
0000000000043a17	movq	%rbx, %rdi
0000000000043a1a	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043a1f	leaq	-0xd8(%rbp), %r15
0000000000043a26	movsd	0x6c98a(%rip), %xmm0
0000000000043a2e	movq	%r15, %rdi
0000000000043a31	movq	%rbx, %rsi
0000000000043a34	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000043a39	movq	-0x30(%rbp), %rax
0000000000043a3d	movq	%rax, 0x28(%rsp)
0000000000043a42	movaps	-0x40(%rbp), %xmm0
0000000000043a46	movups	%xmm0, 0x18(%rsp)
0000000000043a4b	movq	-0x50(%rbp), %rax
0000000000043a4f	movq	%rax, 0x10(%rsp)
0000000000043a54	movaps	-0x60(%rbp), %xmm0
0000000000043a58	movups	%xmm0, (%rsp)
0000000000043a5c	leaq	-0xa8(%rbp), %rbx
0000000000043a63	movq	%rbx, %rdi
0000000000043a66	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043a6b	movq	%r14, %rdi
0000000000043a6e	movq	%r15, %rsi
0000000000043a71	movq	%rbx, %rdx
0000000000043a74	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000043a79	movq	0x10(%r14), %rax
0000000000043a7d	movq	%rax, 0x10(%rsp)
0000000000043a82	movupd	(%r14), %xmm0
0000000000043a87	movupd	%xmm0, (%rsp)
0000000000043a8c	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000043a91	mulsd	0x6c927(%rip), %xmm0
0000000000043a99	callq	0xacf7e                         ## symbol stub for: _sin
0000000000043a9e	movsd	-0x70(%rbp), %xmm1
0000000000043aa3	movsd	-0x68(%rbp), %xmm2
0000000000043aa8	subsd	%xmm1, %xmm2
0000000000043aac	mulsd	%xmm2, %xmm0
0000000000043ab0	addsd	%xmm1, %xmm0
0000000000043ab4	addq	$0xf0, %rsp
0000000000043abb	popq	%rbx
0000000000043abc	popq	%r12
0000000000043abe	popq	%r14
0000000000043ac0	popq	%r15
0000000000043ac2	popq	%rbp
0000000000043ac3	retq
