__ZNK16PCBinaryXMLField11getAsStringEP8PCString:
000000000006617e	pushq	%rbp
000000000006617f	movq	%rsp, %rbp
0000000000066182	pushq	%rbx
0000000000066183	subq	$0x98, %rsp
000000000006618a	movq	%rsi, %rbx
000000000006618d	movq	0xe208c(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000066194	movq	(%rax), %rax
0000000000066197	movq	%rax, -0x10(%rbp)
000000000006619b	xorps	%xmm0, %xmm0
000000000006619e	movaps	%xmm0, -0x20(%rbp)
00000000000661a2	movaps	%xmm0, -0x30(%rbp)
00000000000661a6	movaps	%xmm0, -0x40(%rbp)
00000000000661aa	movaps	%xmm0, -0x50(%rbp)
00000000000661ae	movaps	%xmm0, -0x60(%rbp)
00000000000661b2	movaps	%xmm0, -0x70(%rbp)
00000000000661b6	movaps	%xmm0, -0x80(%rbp)
00000000000661ba	movaps	%xmm0, -0x90(%rbp)
00000000000661c1	movl	(%rdi), %eax
00000000000661c3	cmpq	$0x6, %rax
00000000000661c7	ja	0x662ab
00000000000661cd	movq	%rdi, %rsi
00000000000661d0	leaq	0x105(%rip), %rcx
00000000000661d7	movslq	(%rcx,%rax,4), %rax
00000000000661db	addq	%rcx, %rax
00000000000661de	jmpq	*%rax
00000000000661e0	movq	0x8(%rsi), %rcx
00000000000661e4	leaq	0xcbdfb(%rip), %rdx             ## literal pool for: "%lld"
00000000000661eb	jmp	0x6625d
00000000000661ed	movq	0x28(%rsi), %rcx
00000000000661f1	movl	0x30(%rsi), %r8d
00000000000661f5	movl	0x34(%rsi), %r9d
00000000000661f9	movq	0x38(%rsi), %rax
00000000000661fd	movq	%rax, (%rsp)
0000000000066201	leaq	0xcbe18(%rip), %rdx             ## literal pool for: "%lld %d %x %lld"
0000000000066208	leaq	-0x90(%rbp), %rdi
000000000006620f	movl	$0x80, %esi
0000000000066214	xorl	%eax, %eax
0000000000066216	callq	0xdeb3a                         ## symbol stub for: _snprintf
000000000006621b	jmp	0x662ab
0000000000066220	xorps	%xmm0, %xmm0
0000000000066223	cvtss2sd	0x18(%rsi), %xmm0
0000000000066228	leaq	0xcbdc1(%rip), %rdx             ## literal pool for: "%.10g"
000000000006622f	jmp	0x6623d
0000000000066231	movsd	0x20(%rsi), %xmm0
0000000000066236	leaq	0xccc00(%rip), %rdx             ## literal pool for: "%.16lg"
000000000006623d	leaq	-0x90(%rbp), %rdi
0000000000066244	movl	$0x80, %esi
0000000000066249	movb	$0x1, %al
000000000006624b	callq	0xdeb3a                         ## symbol stub for: _snprintf
0000000000066250	jmp	0x662ab
0000000000066252	movq	0x10(%rsi), %rcx
0000000000066256	leaq	0xcbd8e(%rip), %rdx             ## literal pool for: "%llu"
000000000006625d	leaq	-0x90(%rbp), %rdi
0000000000066264	movl	$0x80, %esi
0000000000066269	xorl	%eax, %eax
000000000006626b	callq	0xdeb3a                         ## symbol stub for: _snprintf
0000000000066270	jmp	0x662ab
0000000000066272	addq	$0x40, %rsi
0000000000066276	movq	%rbx, %rdi
0000000000066279	callq	__ZN8PCString3setERKS_          ## PCString::set(PCString const&)
000000000006627e	jmp	0x662ba
0000000000066280	movl	0x48(%rsi), %ecx
0000000000066283	movl	0x4c(%rsi), %r8d
0000000000066287	movl	0x50(%rsi), %r9d
000000000006628b	movl	0x54(%rsi), %eax
000000000006628e	movl	%eax, (%rsp)
0000000000066291	leaq	0xcb4b3(%rip), %rdx             ## literal pool for: "%08x%08x%08x%08x"
0000000000066298	leaq	-0x90(%rbp), %rdi
000000000006629f	movl	$0x80, %esi
00000000000662a4	xorl	%eax, %eax
00000000000662a6	callq	0xdeb3a                         ## symbol stub for: _snprintf
00000000000662ab	leaq	-0x90(%rbp), %rsi
00000000000662b2	movq	%rbx, %rdi
00000000000662b5	callq	__ZN8PCString3setEPKc           ## PCString::set(char const*)
00000000000662ba	movq	0xe1f5f(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
00000000000662c1	movq	(%rax), %rax
00000000000662c4	cmpq	-0x10(%rbp), %rax
00000000000662c8	jne	0x662d6
00000000000662ca	movb	$0x1, %al
00000000000662cc	addq	$0x98, %rsp
00000000000662d3	popq	%rbx
00000000000662d4	popq	%rbp
00000000000662d5	retq
00000000000662d6	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
00000000000662db	nop
00000000000662dc	addb	$-0x1, %al
00000000000662de	.byte 0xff #bad opcode
00000000000662df	pushq	-0x1(%rsi)
00000000000662e2	.byte 0xff #bad opcode
00000000000662e3	incl	-0x1(%rdi,%rdi,8)
00000000000662e7	callq	*-0x1(%rbp)
00000000000662ea	.byte 0xff #bad opcode
00000000000662eb	callq	*(%rcx)
00000000000662ed	.byte 0xff #bad opcode
00000000000662ee	.byte 0xff #bad opcode
00000000000662ef	callq	*-0x5b000001(%rsi)
00000000000662f5	.byte 0xff #bad opcode
00000000000662f6	.byte 0xff #bad opcode
00000000000662f7	callq	*0x48(%rbp)
00000000000662fa	movl	%esp, %ebp
00000000000662fc	movq	0x90(%rdi), %rcx
0000000000066303	testq	%rcx, %rcx
0000000000066306	je	0x66335
0000000000066308	movq	%rdi, %rax
000000000006630b	addq	$0x90, %rax
0000000000066311	movq	%rax, %rdi
0000000000066314	xorl	%r8d, %r8d
0000000000066317	cmpl	%esi, 0x20(%rcx)
000000000006631a	setb	%r8b
000000000006631e	cmovaeq	%rcx, %rdi
0000000000066322	movq	(%rcx,%r8,8), %rcx
0000000000066326	testq	%rcx, %rcx
0000000000066329	jne	0x66314
000000000006632b	cmpq	%rax, %rdi
000000000006632e	je	0x66335
0000000000066330	cmpl	0x20(%rdi), %esi
0000000000066333	jae	0x66339
0000000000066335	xorl	%eax, %eax
0000000000066337	popq	%rbp
0000000000066338	retq
0000000000066339	addq	$0x28, %rdi
000000000006633d	movq	%rdx, %rsi
0000000000066340	popq	%rbp
0000000000066341	jmp	__ZNK16PCBinaryXMLField10getAsInt32EPi ## PCBinaryXMLField::getAsInt32(int*) const
