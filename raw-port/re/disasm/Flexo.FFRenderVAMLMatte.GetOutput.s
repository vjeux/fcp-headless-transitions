__ZN17FFRenderVAMLMatte9GetOutputEP10HGRenderer:
00000000006880e0	pushq	%rbp
00000000006880e1	movq	%rsp, %rbp
00000000006880e4	pushq	%r15
00000000006880e6	pushq	%r14
00000000006880e8	pushq	%r12
00000000006880ea	pushq	%rbx
00000000006880eb	movq	%rdi, %rbx
00000000006880ee	movl	0x1b8(%rdi), %ecx
00000000006880f4	movl	0x1bc(%rdi), %r8d
00000000006880fb	subl	0x1b0(%rdi), %ecx
0000000000688101	subl	0x1b4(%rdi), %r8d
0000000000688108	movq	%rsi, %r14
000000000068810b	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000688110	addq	0x1c8(%rbx), %rdi
0000000000688117	xorl	%esi, %esi
0000000000688119	xorl	%edx, %edx
000000000068811b	callq	0x1496c12                       ## symbol stub for: __ZN6HGRect4InitEiiii
0000000000688120	movq	0x1c8(%rbx), %rax
0000000000688127	movups	0x198(%rbx), %xmm0
000000000068812e	movq	0x1a8(%rbx), %rcx
0000000000688135	movq	%rcx, 0x1a8(%rax)
000000000068813c	movups	%xmm0, 0x198(%rax)
0000000000688143	movq	0x1c8(%rbx), %r15
000000000068814a	movq	%r14, %rdi
000000000068814d	movq	%rbx, %rsi
0000000000688150	xorl	%edx, %edx
0000000000688152	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
0000000000688157	movq	(%r15), %rcx
000000000068815a	movq	%r15, %rdi
000000000068815d	xorl	%esi, %esi
000000000068815f	movq	%rax, %rdx
0000000000688162	callq	*0x78(%rcx)
0000000000688165	movq	0x1c8(%rbx), %r15
000000000068816c	movq	%r14, %rdi
000000000068816f	movq	%rbx, %rsi
0000000000688172	movl	$0x1, %edx
0000000000688177	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
000000000068817c	movq	(%r15), %rcx
000000000068817f	movq	%r15, %rdi
0000000000688182	movl	$0x1, %esi
0000000000688187	movq	%rax, %rdx
000000000068818a	callq	*0x78(%rcx)
000000000068818d	movq	0x1c8(%rbx), %r15
0000000000688194	testq	%r15, %r15
0000000000688197	je	0x6881f3
0000000000688199	movq	%r15, %rdi
000000000068819c	movl	$0x1, %esi
00000000006881a1	callq	0x1496be2                       ## symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
00000000006881a6	movq	(%r15), %rax
00000000006881a9	movq	%r15, %rdi
00000000006881ac	callq	*0x70(%rax)
00000000006881af	testl	%eax, %eax
00000000006881b1	jle	0x6881f3
00000000006881b3	xorl	%r12d, %r12d
00000000006881b6	jmp	0x6881d1
00000000006881b8	nopl	(%rax,%rax)
00000000006881c0	incl	%r12d
00000000006881c3	movq	(%r15), %rax
00000000006881c6	movq	%r15, %rdi
00000000006881c9	callq	*0x70(%rax)
00000000006881cc	cmpl	%eax, %r12d
00000000006881cf	jge	0x6881f3
00000000006881d1	movq	%r14, %rdi
00000000006881d4	movq	%r15, %rsi
00000000006881d7	movl	%r12d, %edx
00000000006881da	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
00000000006881df	testq	%rax, %rax
00000000006881e2	je	0x6881c0
00000000006881e4	movq	%rax, %rdi
00000000006881e7	movl	$0x1, %esi
00000000006881ec	callq	0x1496be2                       ## symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
00000000006881f1	jmp	0x6881c0
00000000006881f3	movq	0x1c8(%rbx), %rax
00000000006881fa	popq	%rbx
00000000006881fb	popq	%r12
00000000006881fd	popq	%r14
00000000006881ff	popq	%r15
0000000000688201	popq	%rbp
0000000000688202	retq
0000000000688203	nopw	%cs:(%rax,%rax)
