__ZN25OZLogarithmicInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
0000000000045580	pushq	%rbp
0000000000045581	movq	%rsp, %rbp
0000000000045584	pushq	%r15
0000000000045586	pushq	%r14
0000000000045588	pushq	%r12
000000000004558a	pushq	%rbx
000000000004558b	subq	$0xd0, %rsp
0000000000045592	movq	%r9, %rbx
0000000000045595	movq	%r8, %r15
0000000000045598	movq	%rdx, %r12
000000000004559b	movq	%rsi, %r14
000000000004559e	movq	0x20(%rcx), %rax
00000000000455a2	movq	%rax, -0x40(%rbp)
00000000000455a6	movups	0x10(%rcx), %xmm0
00000000000455aa	movaps	%xmm0, -0x50(%rbp)
00000000000455ae	movq	0x20(%r8), %rax
00000000000455b2	movq	%rax, -0x60(%rbp)
00000000000455b6	movups	0x10(%r8), %xmm0
00000000000455bb	movaps	%xmm0, -0x70(%rbp)
00000000000455bf	movq	(%rcx), %rax
00000000000455c2	movq	%rcx, %rdi
00000000000455c5	movq	%rdx, %rsi
00000000000455c8	callq	*0x18(%rax)
00000000000455cb	movsd	%xmm0, -0x28(%rbp)
00000000000455d0	movq	(%r15), %rax
00000000000455d3	movq	%r15, %rdi
00000000000455d6	movq	%r12, %rsi
00000000000455d9	callq	*0x18(%rax)
00000000000455dc	movsd	%xmm0, -0x30(%rbp)
00000000000455e1	movq	-0x60(%rbp), %rax
00000000000455e5	movq	%rax, 0x28(%rsp)
00000000000455ea	movaps	-0x70(%rbp), %xmm0
00000000000455ee	movups	%xmm0, 0x18(%rsp)
00000000000455f3	movq	-0x40(%rbp), %rax
00000000000455f7	movq	%rax, 0x10(%rsp)
00000000000455fc	movaps	-0x50(%rbp), %xmm0
0000000000045600	movups	%xmm0, (%rsp)
0000000000045604	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000045609	testl	%eax, %eax
000000000004560b	jle	0x4564b
000000000004560d	leaq	-0x90(%rbp), %r15
0000000000045614	movq	%r15, %rdi
0000000000045617	movq	%r14, %rsi
000000000004561a	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
000000000004561f	movq	0x10(%r15), %rax
0000000000045623	movq	%rax, 0x28(%rsp)
0000000000045628	movups	(%r15), %xmm0
000000000004562c	movups	%xmm0, 0x18(%rsp)
0000000000045631	movq	-0x40(%rbp), %rax
0000000000045635	movq	%rax, 0x10(%rsp)
000000000004563a	movaps	-0x50(%rbp), %xmm0
000000000004563e	movups	%xmm0, (%rsp)
0000000000045642	leaq	-0x70(%rbp), %rdi
0000000000045646	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000004564b	movq	-0x40(%rbp), %rax
000000000004564f	movq	%rax, 0x28(%rsp)
0000000000045654	movaps	-0x50(%rbp), %xmm0
0000000000045658	movups	%xmm0, 0x18(%rsp)
000000000004565d	movq	-0x60(%rbp), %rax
0000000000045661	movq	%rax, 0x10(%rsp)
0000000000045666	movaps	-0x70(%rbp), %xmm0
000000000004566a	movups	%xmm0, (%rsp)
000000000004566e	leaq	-0xa8(%rbp), %r14
0000000000045675	movq	%r14, %rdi
0000000000045678	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000004567d	movq	0x84e3c(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
0000000000045684	movq	0x10(%rax), %rcx
0000000000045688	movq	%rcx, -0x80(%rbp)
000000000004568c	movups	(%rax), %xmm0
000000000004568f	movaps	%xmm0, -0x90(%rbp)
0000000000045696	movq	-0x80(%rbp), %rax
000000000004569a	movq	%rax, 0x28(%rsp)
000000000004569f	movaps	-0x90(%rbp), %xmm0
00000000000456a6	movups	%xmm0, 0x18(%rsp)
00000000000456ab	movq	0x10(%r14), %rax
00000000000456af	movq	%rax, 0x10(%rsp)
00000000000456b4	movups	(%r14), %xmm0
00000000000456b8	movups	%xmm0, (%rsp)
00000000000456bc	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000456c1	testl	%eax, %eax
00000000000456c3	je	0x4577b
00000000000456c9	movq	0x10(%rbx), %rax
00000000000456cd	leaq	-0x90(%rbp), %r14
00000000000456d4	movq	%rax, 0x10(%r14)
00000000000456d8	movups	(%rbx), %xmm0
00000000000456db	movaps	%xmm0, (%r14)
00000000000456df	movq	-0x40(%rbp), %rax
00000000000456e3	movq	%rax, 0x28(%rsp)
00000000000456e8	movaps	-0x50(%rbp), %xmm0
00000000000456ec	movups	%xmm0, 0x18(%rsp)
00000000000456f1	movq	0x10(%r14), %rax
00000000000456f5	movq	%rax, 0x10(%rsp)
00000000000456fa	movaps	(%r14), %xmm0
00000000000456fe	movups	%xmm0, (%rsp)
0000000000045702	leaq	-0xc0(%rbp), %rbx
0000000000045709	movq	%rbx, %rdi
000000000004570c	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000045711	leaq	-0xa8(%rbp), %rdx
0000000000045718	movq	%r14, %rdi
000000000004571b	movq	%rbx, %rsi
000000000004571e	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000045723	movq	0x10(%r14), %rax
0000000000045727	movq	%rax, 0x10(%rsp)
000000000004572c	movupd	(%r14), %xmm0
0000000000045731	movupd	%xmm0, (%rsp)
0000000000045736	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000004573b	movsd	-0x30(%rbp), %xmm1
0000000000045740	subsd	-0x28(%rbp), %xmm1
0000000000045745	divsd	0x6b2eb(%rip), %xmm1
000000000004574d	movsd	%xmm1, -0x30(%rbp)
0000000000045752	mulsd	0x6b2e6(%rip), %xmm0
000000000004575a	addsd	0x69dc6(%rip), %xmm0
0000000000045762	callq	0xaceee                         ## symbol stub for: _log
0000000000045767	mulsd	-0x30(%rbp), %xmm0
000000000004576c	movsd	-0x28(%rbp), %xmm1
0000000000045771	addsd	%xmm0, %xmm1
0000000000045775	movapd	%xmm1, %xmm0
0000000000045779	jmp	0x45780
000000000004577b	movsd	-0x28(%rbp), %xmm0
0000000000045780	addq	$0xd0, %rsp
0000000000045787	popq	%rbx
0000000000045788	popq	%r12
000000000004578a	popq	%r14
000000000004578c	popq	%r15
000000000004578e	popq	%rbp
000000000004578f	retq
