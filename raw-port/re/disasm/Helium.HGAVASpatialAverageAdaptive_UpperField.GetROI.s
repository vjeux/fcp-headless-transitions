__ZN38HGAVASpatialAverageAdaptive_UpperField6GetROIEP10HGRendereri6HGRect:
00000000002220d0	pushq	%rbp
00000000002220d1	movq	%rsp, %rbp
00000000002220d4	pushq	%r14
00000000002220d6	pushq	%rbx
00000000002220d7	movq	%r8, %rbx
00000000002220da	movq	%rcx, %r14
00000000002220dd	testl	%edx, %edx
00000000002220df	je	0x2220f9
00000000002220e1	cmpl	$0x1, %edx
00000000002220e4	jne	0x222127
00000000002220e6	movl	$0xfffffffc, %edi               ## imm = 0xFFFFFFFC
00000000002220eb	xorl	%esi, %esi
00000000002220ed	movl	$0x4, %edx
00000000002220f2	movl	$0x1, %ecx
00000000002220f7	jmp	0x22210d
00000000002220f9	movl	$0xfffffffc, %edi               ## imm = 0xFFFFFFFC
00000000002220fe	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000222103	movl	$0x4, %edx
0000000000222108	movl	$0x2, %ecx
000000000022210d	callq	_HGRectMake4i
0000000000222112	movq	%rdx, %rcx
0000000000222115	movq	%r14, %rdi
0000000000222118	movq	%rbx, %rsi
000000000022211b	movq	%rax, %rdx
000000000022211e	popq	%rbx
000000000022211f	popq	%r14
0000000000222121	popq	%rbp
0000000000222122	jmp	_HGRectGrow
0000000000222127	leaq	_HGRectNull(%rip), %rcx
000000000022212e	movq	(%rcx), %rax
0000000000222131	movq	0x8(%rcx), %rdx
0000000000222135	popq	%rbx
0000000000222136	popq	%r14
0000000000222138	popq	%rbp
0000000000222139	retq
000000000022213a	addb	%al, (%rax)
000000000022213c	addb	%al, (%rax)
000000000022213e	addb	%al, (%rax)
