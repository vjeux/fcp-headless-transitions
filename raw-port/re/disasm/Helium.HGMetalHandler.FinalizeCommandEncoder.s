__ZN14HGMetalHandler22FinalizeCommandEncoderEjmm:
000000000015de10	pushq	%rbp
000000000015de11	movq	%rsp, %rbp
000000000015de14	pushq	%r15
000000000015de16	pushq	%r14
000000000015de18	pushq	%r12
000000000015de1a	pushq	%rbx
000000000015de1b	movq	%rcx, %r14
000000000015de1e	movq	%rdx, %r15
000000000015de21	movl	%esi, %r12d
000000000015de24	movq	%rdi, %rbx
000000000015de27	cmpq	$0x0, 0x108(%rdi)
000000000015de2f	je	0x15de95
000000000015de31	movq	%rbx, %rdi
000000000015de34	callq	__ZN14HGMetalHandler28_setCommandEncoderDebugLabelEv ## HGMetalHandler::_setCommandEncoderDebugLabel()
000000000015de39	movq	0x108(%rbx), %rdi
000000000015de40	movq	0x8fd101(%rip), %rsi            ## Objc selector ref: endEncoding
000000000015de47	callq	*0x8a436b(%rip)                 ## Objc message: -[%rdi endEncoding]
000000000015de4d	incl	0x6f8(%rbx)
000000000015de53	movl	0x700(%rbx), %edx
000000000015de59	incl	%edx
000000000015de5b	movl	%edx, 0x700(%rbx)
000000000015de61	movq	0x90(%rbx), %rax
000000000015de68	movl	0x3f8(%rax), %esi
000000000015de6e	movl	$0x2b79494c, %edi               ## imm = 0x2B79494C
000000000015de73	xorl	%ecx, %ecx
000000000015de75	xorl	%r8d, %r8d
000000000015de78	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
000000000015de7d	movq	0x108(%rbx), %rdi
000000000015de84	callq	*0x8a4336(%rip)                 ## literal pool symbol address: _objc_release
000000000015de8a	movq	$0x0, 0x108(%rbx)
000000000015de95	cmpq	$0x0, 0x100(%rbx)
000000000015de9d	je	0x15dee4
000000000015de9f	cmpl	%r12d, 0x6f8(%rbx)
000000000015dea6	jae	0x15dec4
000000000015dea8	cmpq	%r15, 0x130(%rbx)
000000000015deaf	jae	0x15dec4
000000000015deb1	movq	0x718(%rbx), %rax
000000000015deb8	addq	0x130(%rbx), %rax
000000000015debf	cmpq	%r14, %rax
000000000015dec2	jb	0x15dee4
000000000015dec4	movq	%rbx, %rdi
000000000015dec7	callq	__ZN14HGMetalHandler20_commitCommandBufferEv ## HGMetalHandler::_commitCommandBuffer()
000000000015decc	movq	0x100(%rbx), %rdi
000000000015ded3	callq	*0x8a42e7(%rip)                 ## literal pool symbol address: _objc_release
000000000015ded9	movq	$0x0, 0x100(%rbx)
000000000015dee4	popq	%rbx
000000000015dee5	popq	%r12
000000000015dee7	popq	%r14
000000000015dee9	popq	%r15
000000000015deeb	popq	%rbp
000000000015deec	retq
000000000015deed	nopl	(%rax)
