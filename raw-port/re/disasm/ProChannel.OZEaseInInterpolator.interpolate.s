__ZN20OZEaseInInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
000000000004339e	pushq	%rbp
000000000004339f	movq	%rsp, %rbp
00000000000433a2	pushq	%r15
00000000000433a4	pushq	%r14
00000000000433a6	pushq	%r12
00000000000433a8	pushq	%rbx
00000000000433a9	subq	$0xf0, %rsp
00000000000433b0	movq	%r9, %rbx
00000000000433b3	movq	%r8, %r15
00000000000433b6	movq	%rdx, %r12
00000000000433b9	movq	%rsi, %r14
00000000000433bc	movq	0x20(%rcx), %rax
00000000000433c0	movq	%rax, -0x30(%rbp)
00000000000433c4	movups	0x10(%rcx), %xmm0
00000000000433c8	movaps	%xmm0, -0x40(%rbp)
00000000000433cc	movq	0x20(%r8), %rax
00000000000433d0	movq	%rax, -0x50(%rbp)
00000000000433d4	movups	0x10(%r8), %xmm0
00000000000433d9	movaps	%xmm0, -0x60(%rbp)
00000000000433dd	movq	(%rcx), %rax
00000000000433e0	movq	%rcx, %rdi
00000000000433e3	movq	%rdx, %rsi
00000000000433e6	callq	*0x18(%rax)
00000000000433e9	movsd	%xmm0, -0x70(%rbp)
00000000000433ee	movq	(%r15), %rax
00000000000433f1	movq	%r15, %rdi
00000000000433f4	movq	%r12, %rsi
00000000000433f7	callq	*0x18(%rax)
00000000000433fa	movsd	%xmm0, -0x68(%rbp)
00000000000433ff	movq	-0x50(%rbp), %rax
0000000000043403	movq	%rax, 0x28(%rsp)
0000000000043408	movaps	-0x60(%rbp), %xmm0
000000000004340c	movups	%xmm0, 0x18(%rsp)
0000000000043411	movq	-0x30(%rbp), %rax
0000000000043415	movq	%rax, 0x10(%rsp)
000000000004341a	movaps	-0x40(%rbp), %xmm0
000000000004341e	movups	%xmm0, (%rsp)
0000000000043422	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043427	testl	%eax, %eax
0000000000043429	jle	0x43469
000000000004342b	leaq	-0x90(%rbp), %r15
0000000000043432	movq	%r15, %rdi
0000000000043435	movq	%r14, %rsi
0000000000043438	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
000000000004343d	movq	0x10(%r15), %rax
0000000000043441	movq	%rax, 0x28(%rsp)
0000000000043446	movups	(%r15), %xmm0
000000000004344a	movups	%xmm0, 0x18(%rsp)
000000000004344f	movq	-0x30(%rbp), %rax
0000000000043453	movq	%rax, 0x10(%rsp)
0000000000043458	movaps	-0x40(%rbp), %xmm0
000000000004345c	movups	%xmm0, (%rsp)
0000000000043460	leaq	-0x60(%rbp), %rdi
0000000000043464	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000043469	movq	0x10(%rbx), %rax
000000000004346d	leaq	-0x90(%rbp), %r14
0000000000043474	movq	%rax, 0x10(%r14)
0000000000043478	movups	(%rbx), %xmm0
000000000004347b	movaps	%xmm0, (%r14)
000000000004347f	movq	-0x30(%rbp), %rax
0000000000043483	movq	%rax, 0x28(%rsp)
0000000000043488	movaps	-0x40(%rbp), %xmm0
000000000004348c	movups	%xmm0, 0x18(%rsp)
0000000000043491	movq	0x10(%r14), %rax
0000000000043495	movq	%rax, 0x10(%rsp)
000000000004349a	movaps	(%r14), %xmm0
000000000004349e	movups	%xmm0, (%rsp)
00000000000434a2	leaq	-0xc0(%rbp), %rbx
00000000000434a9	movq	%rbx, %rdi
00000000000434ac	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000434b1	leaq	-0xd8(%rbp), %r15
00000000000434b8	movsd	0x6cef8(%rip), %xmm0
00000000000434c0	movq	%r15, %rdi
00000000000434c3	movq	%rbx, %rsi
00000000000434c6	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
00000000000434cb	movq	-0x30(%rbp), %rax
00000000000434cf	movq	%rax, 0x28(%rsp)
00000000000434d4	movaps	-0x40(%rbp), %xmm0
00000000000434d8	movups	%xmm0, 0x18(%rsp)
00000000000434dd	movq	-0x50(%rbp), %rax
00000000000434e1	movq	%rax, 0x10(%rsp)
00000000000434e6	movaps	-0x60(%rbp), %xmm0
00000000000434ea	movups	%xmm0, (%rsp)
00000000000434ee	leaq	-0xa8(%rbp), %rbx
00000000000434f5	movq	%rbx, %rdi
00000000000434f8	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000434fd	movq	%r14, %rdi
0000000000043500	movq	%r15, %rsi
0000000000043503	movq	%rbx, %rdx
0000000000043506	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
000000000004350b	movq	0x10(%r14), %rax
000000000004350f	movq	%rax, 0x10(%rsp)
0000000000043514	movupd	(%r14), %xmm0
0000000000043519	movupd	%xmm0, (%rsp)
000000000004351e	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000043523	mulsd	0x6ce95(%rip), %xmm0
000000000004352b	callq	0xaced0                         ## symbol stub for: _cos
0000000000043530	movsd	0x6bff0(%rip), %xmm1
0000000000043538	subsd	%xmm0, %xmm1
000000000004353c	movsd	-0x70(%rbp), %xmm2
0000000000043541	movsd	-0x68(%rbp), %xmm0
0000000000043546	subsd	%xmm2, %xmm0
000000000004354a	mulsd	%xmm1, %xmm0
000000000004354e	addsd	%xmm2, %xmm0
0000000000043552	addq	$0xf0, %rsp
0000000000043559	popq	%rbx
000000000004355a	popq	%r12
000000000004355c	popq	%r14
000000000004355e	popq	%r15
0000000000043560	popq	%rbp
0000000000043561	retq
