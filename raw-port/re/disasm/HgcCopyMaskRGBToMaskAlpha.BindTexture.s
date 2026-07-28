__ZN25HgcCopyMaskRGBToMaskAlpha11BindTextureEP9HGHandleri:
00000000006a2290	pushq	%rbp
00000000006a2291	movq	%rsp, %rbp
00000000006a2294	subq	$0x20, %rsp
00000000006a2298	movq	%rdi, -0x10(%rbp)
00000000006a229c	movq	%rsi, -0x18(%rbp)
00000000006a22a0	movl	%edx, -0x1c(%rbp)
00000000006a22a3	movl	-0x1c(%rbp), %eax
00000000006a22a6	testl	%eax, %eax
00000000006a22a8	jne	0x6a230f
00000000006a22aa	jmp	0x6a22ac
00000000006a22ac	movq	-0x18(%rbp), %rdi
00000000006a22b0	movl	-0x1c(%rbp), %esi
00000000006a22b3	movq	(%rdi), %rax
00000000006a22b6	xorl	%edx, %edx
00000000006a22b8	callq	*0x48(%rax)
00000000006a22bb	movq	-0x18(%rbp), %rdi
00000000006a22bf	xorl	%esi, %esi
00000000006a22c1	callq	__ZN9HGHandler9SetFilterEi      ## HGHandler::SetFilter(int)
00000000006a22c6	movq	-0x18(%rbp), %rdi
00000000006a22ca	xorl	%ecx, %ecx
00000000006a22cc	xorl	%eax, %eax
00000000006a22ce	movl	%eax, %r8d
00000000006a22d1	movl	%ecx, %esi
00000000006a22d3	movl	%ecx, %edx
00000000006a22d5	callq	0x6df21c                        ## symbol stub for: __ZN9HGHandler8TexCoordEiiiPKd
00000000006a22da	movq	-0x18(%rbp), %rdi
00000000006a22de	callq	__ZNK9HGHandler11GetRendererEv  ## HGHandler::GetRenderer() const
00000000006a22e3	movq	%rax, %rdi
00000000006a22e6	movq	(%rdi), %rax
00000000006a22e9	movl	$0x2e, %esi
00000000006a22ee	callq	*0x80(%rax)
00000000006a22f4	cmpl	$0x0, %eax
00000000006a22f7	jne	0x6a2306
00000000006a22f9	movq	-0x18(%rbp), %rdi
00000000006a22fd	movq	(%rdi), %rax
00000000006a2300	callq	*0xa8(%rax)
00000000006a2306	movl	$0x0, -0x4(%rbp)
00000000006a230d	jmp	0x6a2316
00000000006a230f	movl	$0xffffffff, -0x4(%rbp)         ## imm = 0xFFFFFFFF
00000000006a2316	movl	-0x4(%rbp), %eax
00000000006a2319	addq	$0x20, %rsp
00000000006a231d	popq	%rbp
00000000006a231e	retq
00000000006a231f	nop
