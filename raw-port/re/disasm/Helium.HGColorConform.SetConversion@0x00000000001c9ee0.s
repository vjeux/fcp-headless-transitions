__ZN14HGColorConform13SetConversionEP12CGColorSpaceS1_:
00000000001c9ee0	pushq	%rbp
00000000001c9ee1	movq	%rsp, %rbp
00000000001c9ee4	pushq	%r15
00000000001c9ee6	pushq	%r14
00000000001c9ee8	pushq	%r12
00000000001c9eea	pushq	%rbx
00000000001c9eeb	movq	%rdx, %r15
00000000001c9eee	movq	%rsi, %r12
00000000001c9ef1	movq	%rdi, %r14
00000000001c9ef4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9ef9	movl	$0xffffffff, 0x1e4(%r14)        ## imm = 0xFFFFFFFF
00000000001c9f04	movq	%r14, %rdi
00000000001c9f07	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001c9f0c	testq	%r12, %r12
00000000001c9f0f	setne	%al
00000000001c9f12	testq	%r15, %r15
00000000001c9f15	setne	%cl
00000000001c9f18	testb	%cl, %al
00000000001c9f1a	je	0x1c9f64
00000000001c9f1c	movq	%r12, %rdi
00000000001c9f1f	movq	%r15, %rsi
00000000001c9f22	callq	0x3c4afc                        ## symbol stub for: _CFEqual
00000000001c9f27	movb	$0x1, %bl
00000000001c9f29	testb	%al, %al
00000000001c9f2b	jne	0x1c9f74
00000000001c9f2d	movq	%r12, %rdi
00000000001c9f30	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001c9f35	testq	%rax, %rax
00000000001c9f38	je	0x1c9f7f
00000000001c9f3a	movq	%rax, %r12
00000000001c9f3d	movq	%rax, %rdi
00000000001c9f40	xorl	%esi, %esi
00000000001c9f42	callq	0x3c4d96                        ## symbol stub for: _ColorSyncProfileCreate
00000000001c9f47	movq	%rax, %rbx
00000000001c9f4a	movq	%r12, %rdi
00000000001c9f4d	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9f52	movq	%r15, %rdi
00000000001c9f55	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001c9f5a	testq	%rax, %rax
00000000001c9f5d	jne	0x1c9f8e
00000000001c9f5f	jmp	0x1c9fec
00000000001c9f64	leaq	0x72c29f(%rip), %rdi            ## literal pool for: "SetConversion does not allow NULL CGColorSpaceRef"
00000000001c9f6b	xorl	%ebx, %ebx
00000000001c9f6d	xorl	%eax, %eax
00000000001c9f6f	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000001c9f74	movl	%ebx, %eax
00000000001c9f76	popq	%rbx
00000000001c9f77	popq	%r12
00000000001c9f79	popq	%r14
00000000001c9f7b	popq	%r15
00000000001c9f7d	popq	%rbp
00000000001c9f7e	retq
00000000001c9f7f	movq	%r15, %rdi
00000000001c9f82	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001c9f87	xorl	%ebx, %ebx
00000000001c9f89	testq	%rax, %rax
00000000001c9f8c	je	0x1c9f74
00000000001c9f8e	movq	%rax, %r12
00000000001c9f91	movq	%rax, %rdi
00000000001c9f94	xorl	%esi, %esi
00000000001c9f96	callq	0x3c4d96                        ## symbol stub for: _ColorSyncProfileCreate
00000000001c9f9b	movq	%rax, %r15
00000000001c9f9e	movq	%r12, %rdi
00000000001c9fa1	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9fa6	testq	%rbx, %rbx
00000000001c9fa9	setne	%al
00000000001c9fac	testq	%r15, %r15
00000000001c9faf	setne	%cl
00000000001c9fb2	andb	%al, %cl
00000000001c9fb4	cmpb	$0x1, %cl
00000000001c9fb7	jne	0x1c9fdf
00000000001c9fb9	movq	%r14, %rdi
00000000001c9fbc	movq	%rbx, %rsi
00000000001c9fbf	movq	%r15, %rdx
00000000001c9fc2	callq	__ZN14HGColorConform13SetConversionEPK16ColorSyncProfileS2_ ## HGColorConform::SetConversion(ColorSyncProfile const*, ColorSyncProfile const*)
00000000001c9fc7	movl	%eax, %r14d
00000000001c9fca	movq	%rbx, %rdi
00000000001c9fcd	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9fd2	movq	%r15, %rdi
00000000001c9fd5	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9fda	movl	%r14d, %eax
00000000001c9fdd	jmp	0x1c9f76
00000000001c9fdf	testq	%r15, %r15
00000000001c9fe2	je	0x1c9fec
00000000001c9fe4	movq	%r15, %rdi
00000000001c9fe7	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9fec	testq	%rbx, %rbx
00000000001c9fef	je	0x1c9ff9
00000000001c9ff1	movq	%rbx, %rdi
00000000001c9ff4	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001c9ff9	xorl	%ebx, %ebx
00000000001c9ffb	jmp	0x1c9f74
