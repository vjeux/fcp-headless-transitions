__ZN22OZConstantInterpolator9subDivideER8OZSplineRK6CMTimePvS5_S5_:
000000000004318e	pushq	%rbp
000000000004318f	movq	%rsp, %rbp
0000000000043192	pushq	%r15
0000000000043194	pushq	%r14
0000000000043196	pushq	%r13
0000000000043198	pushq	%r12
000000000004319a	pushq	%rbx
000000000004319b	subq	$0xa8, %rsp
00000000000431a2	movq	%r8, %r15
00000000000431a5	movq	%rcx, %r12
00000000000431a8	movq	%rdx, -0x50(%rbp)
00000000000431ac	movq	%rsi, %r14
00000000000431af	movq	%rdi, -0x48(%rbp)
00000000000431b3	movq	0x20(%rcx), %rax
00000000000431b7	movq	%rax, -0x30(%rbp)
00000000000431bb	movups	0x10(%rcx), %xmm0
00000000000431bf	movaps	%xmm0, -0x40(%rbp)
00000000000431c3	movq	0x20(%r8), %rax
00000000000431c7	movq	%rax, -0x60(%rbp)
00000000000431cb	movups	0x10(%r8), %xmm0
00000000000431d0	movaps	%xmm0, -0x70(%rbp)
00000000000431d4	movq	0x20(%r8), %rax
00000000000431d8	movq	%rax, 0x28(%rsp)
00000000000431dd	movups	0x10(%r8), %xmm0
00000000000431e2	movups	%xmm0, 0x18(%rsp)
00000000000431e7	movq	0x20(%rcx), %rax
00000000000431eb	movq	%rax, 0x10(%rsp)
00000000000431f0	movups	0x10(%rcx), %xmm0
00000000000431f4	movups	%xmm0, (%rsp)
00000000000431f8	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000431fd	testl	%eax, %eax
00000000000431ff	jle	0x4323e
0000000000043201	leaq	-0x88(%rbp), %rbx
0000000000043208	movq	%rbx, %rdi
000000000004320b	movq	%r14, %rsi
000000000004320e	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
0000000000043213	movq	0x10(%rbx), %rax
0000000000043217	movq	%rax, 0x28(%rsp)
000000000004321c	movups	(%rbx), %xmm0
000000000004321f	movups	%xmm0, 0x18(%rsp)
0000000000043224	movq	-0x30(%rbp), %rax
0000000000043228	movq	%rax, 0x10(%rsp)
000000000004322d	movaps	-0x40(%rbp), %xmm0
0000000000043231	movups	%xmm0, (%rsp)
0000000000043235	leaq	-0x70(%rbp), %rdi
0000000000043239	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000004323e	movq	-0x30(%rbp), %rax
0000000000043242	movq	%rax, 0x28(%rsp)
0000000000043247	movaps	-0x40(%rbp), %xmm0
000000000004324b	movups	%xmm0, 0x18(%rsp)
0000000000043250	movq	-0x60(%rbp), %rax
0000000000043254	movq	%rax, 0x10(%rsp)
0000000000043259	movaps	-0x70(%rbp), %xmm0
000000000004325d	movups	%xmm0, (%rsp)
0000000000043261	leaq	-0x88(%rbp), %r13
0000000000043268	movq	%r13, %rdi
000000000004326b	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043270	leaq	-0xa0(%rbp), %rbx
0000000000043277	movsd	0x6d141(%rip), %xmm0
000000000004327f	movq	%rbx, %rdi
0000000000043282	movq	%r13, %rsi
0000000000043285	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
000000000004328a	movq	-0x30(%rbp), %rax
000000000004328e	movq	%rax, 0x28(%rsp)
0000000000043293	movaps	-0x40(%rbp), %xmm0
0000000000043297	movups	%xmm0, 0x18(%rsp)
000000000004329c	movq	0x10(%rbx), %rax
00000000000432a0	movq	%rax, 0x10(%rsp)
00000000000432a5	movaps	(%rbx), %xmm0
00000000000432a8	movups	%xmm0, (%rsp)
00000000000432ac	movq	%r13, %rdi
00000000000432af	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000432b4	movq	0x10(%r13), %rax
00000000000432b8	movq	%rax, 0x10(%rbx)
00000000000432bc	movups	(%r13), %xmm0
00000000000432c1	movaps	%xmm0, (%rbx)
00000000000432c4	movq	-0x48(%rbp), %rdi
00000000000432c8	movq	(%rdi), %rax
00000000000432cb	xorl	%ecx, %ecx
00000000000432cd	movl	%ecx, 0x8(%rsp)
00000000000432d1	movl	%ecx, (%rsp)
00000000000432d4	movq	%r14, %rsi
00000000000432d7	movq	-0x50(%rbp), %r13
00000000000432db	movq	%r13, %rdx
00000000000432de	movq	%r12, %rcx
00000000000432e1	movq	%r15, %r8
00000000000432e4	movq	%rbx, %r9
00000000000432e7	callq	*0x18(%rax)
00000000000432ea	movq	(%r14), %rax
00000000000432ed	movq	%r14, %rdi
00000000000432f0	movq	%rbx, %rsi
00000000000432f3	movq	%r13, %rdx
00000000000432f6	movl	$0x1, %ecx
00000000000432fb	callq	*0xc0(%rax)
0000000000043301	addq	$0xa8, %rsp
0000000000043308	popq	%rbx
0000000000043309	popq	%r12
000000000004330b	popq	%r13
000000000004330d	popq	%r14
000000000004330f	popq	%r15
0000000000043311	popq	%rbp
0000000000043312	retq
0000000000043313	nop
