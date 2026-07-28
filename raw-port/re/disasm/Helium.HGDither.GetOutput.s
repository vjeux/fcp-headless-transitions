__ZN8HGDither9GetOutputEP10HGRenderer:
000000000006fa50	pushq	%rbp
000000000006fa51	movq	%rsp, %rbp
000000000006fa54	pushq	%r15
000000000006fa56	pushq	%r14
000000000006fa58	pushq	%r13
000000000006fa5a	pushq	%r12
000000000006fa5c	pushq	%rbx
000000000006fa5d	pushq	%rax
000000000006fa5e	movq	%rsi, %r13
000000000006fa61	movq	%rdi, %r15
000000000006fa64	movzbl	__ZGVZN8HGDither9GetOutputEP10HGRendererE10lutFactory(%rip), %eax ## guard variable for HGDither::GetOutput(HGRenderer*)::lutFactory
000000000006fa6b	testb	%al, %al
000000000006fa6d	je	0x6fcfe
000000000006fa73	movl	$0x10, %edi
000000000006fa78	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000006fa7d	movq	%rax, %r14
000000000006fa80	leaq	0x999149(%rip), %rax
000000000006fa87	movq	%rax, (%r14)
000000000006fa8a	movl	$0x3, 0x8(%r14)
000000000006fa92	movq	0x228(%r13), %rdi
000000000006fa99	leaq	__ZZN8HGDither9GetOutputEP10HGRendererE10lutFactory(%rip), %rsi ## HGDither::GetOutput(HGRenderer*)::lutFactory
000000000006faa0	callq	__ZN17HGLUTCacheManager11getLUTCacheEPN10HGLUTCache15LUTEntryFactoryE ## HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*)
000000000006faa5	movq	%rax, %rdi
000000000006faa8	movq	%r14, %rsi
000000000006faab	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
000000000006fab0	movq	%rax, %rbx
000000000006fab3	movq	(%r14), %rax
000000000006fab6	movq	%r14, %rdi
000000000006fab9	callq	*0x8(%rax)
000000000006fabc	movl	$0x1f0, %edi                    ## imm = 0x1F0
000000000006fac1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fac6	movq	%rax, %r14
000000000006fac9	movq	%rax, %rdi
000000000006facc	movq	%rbx, %rsi
000000000006facf	callq	__ZN14HGBitmapLoaderC1EP8HGBitmap ## HGBitmapLoader::HGBitmapLoader(HGBitmap*)
000000000006fad4	movq	%r13, %rdi
000000000006fad7	movq	%r15, %rsi
000000000006fada	xorl	%edx, %edx
000000000006fadc	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006fae1	movq	%rax, %r12
000000000006fae4	movq	(%r13), %rax
000000000006fae8	movq	%r13, %rdi
000000000006faeb	callq	*0x130(%rax)
000000000006faf1	movzbl	0x1c0(%r15), %ecx
000000000006faf9	testb	%al, %al
000000000006fafb	je	0x6fb33
000000000006fafd	testb	%cl, %cl
000000000006faff	je	0x6fb74
000000000006fb01	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000006fb06	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fb0b	movq	%rax, %r13
000000000006fb0e	movq	%rax, %rdi
000000000006fb11	callq	__ZN13HgcDither_CPUC1Ev         ## HgcDither_CPU::HgcDither_CPU()
000000000006fb16	movq	0x198(%r15), %rdi
000000000006fb1d	cmpq	%r13, %rdi
000000000006fb20	je	0x6fca2
000000000006fb26	testq	%rdi, %rdi
000000000006fb29	je	0x6fba4
000000000006fb2b	movq	(%rdi), %rax
000000000006fb2e	callq	*0x18(%rax)
000000000006fb31	jmp	0x6fba4
000000000006fb33	testb	%cl, %cl
000000000006fb35	je	0x6fc0f
000000000006fb3b	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000006fb40	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fb45	movq	%rax, %r13
000000000006fb48	movq	%rax, %rdi
000000000006fb4b	callq	__ZN13HgcDither_GPUC1Ev         ## HgcDither_GPU::HgcDither_GPU()
000000000006fb50	movq	0x198(%r15), %rdi
000000000006fb57	cmpq	%r13, %rdi
000000000006fb5a	je	0x6fcba
000000000006fb60	testq	%rdi, %rdi
000000000006fb63	je	0x6fc3f
000000000006fb69	movq	(%rdi), %rax
000000000006fb6c	callq	*0x18(%rax)
000000000006fb6f	jmp	0x6fc3f
000000000006fb74	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000006fb79	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fb7e	movq	%rax, %r13
000000000006fb81	movq	%rax, %rdi
000000000006fb84	callq	__ZN21HgcDither_CPU_NoClampC1Ev ## HgcDither_CPU_NoClamp::HgcDither_CPU_NoClamp()
000000000006fb89	movq	0x198(%r15), %rdi
000000000006fb90	cmpq	%r13, %rdi
000000000006fb93	je	0x6fcce
000000000006fb99	testq	%rdi, %rdi
000000000006fb9c	je	0x6fba4
000000000006fb9e	movq	(%rdi), %rax
000000000006fba1	callq	*0x18(%rax)
000000000006fba4	movq	%r13, 0x198(%r15)
000000000006fbab	movl	$0x1d0, %edi                    ## imm = 0x1D0
000000000006fbb0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fbb5	movq	%rax, %r13
000000000006fbb8	movq	%rax, %rdi
000000000006fbbb	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
000000000006fbc0	movq	%r13, %rdi
000000000006fbc3	movl	$0x3, %esi
000000000006fbc8	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
000000000006fbcd	movq	(%r13), %rax
000000000006fbd1	movq	%r13, %rdi
000000000006fbd4	xorl	%esi, %esi
000000000006fbd6	movq	%r14, %rdx
000000000006fbd9	callq	*0x78(%rax)
000000000006fbdc	movq	0x198(%r15), %rdi
000000000006fbe3	movq	(%rdi), %rax
000000000006fbe6	xorl	%esi, %esi
000000000006fbe8	movq	%r12, %rdx
000000000006fbeb	callq	*0x78(%rax)
000000000006fbee	movq	0x198(%r15), %rdi
000000000006fbf5	movq	(%rdi), %rax
000000000006fbf8	movl	$0x1, %esi
000000000006fbfd	movq	%r13, %rdx
000000000006fc00	callq	*0x78(%rax)
000000000006fc03	movq	(%r13), %rax
000000000006fc07	movq	%r13, %rdi
000000000006fc0a	callq	*0x18(%rax)
000000000006fc0d	jmp	0x6fc6d
000000000006fc0f	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000006fc14	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000006fc19	movq	%rax, %r13
000000000006fc1c	movq	%rax, %rdi
000000000006fc1f	callq	__ZN21HgcDither_GPU_NoClampC1Ev ## HgcDither_GPU_NoClamp::HgcDither_GPU_NoClamp()
000000000006fc24	movq	0x198(%r15), %rdi
000000000006fc2b	cmpq	%r13, %rdi
000000000006fc2e	je	0x6fce6
000000000006fc34	testq	%rdi, %rdi
000000000006fc37	je	0x6fc3f
000000000006fc39	movq	(%rdi), %rax
000000000006fc3c	callq	*0x18(%rax)
000000000006fc3f	movq	%r13, 0x198(%r15)
000000000006fc46	movq	0x198(%r15), %rdi
000000000006fc4d	movq	(%rdi), %rax
000000000006fc50	xorl	%esi, %esi
000000000006fc52	movq	%r12, %rdx
000000000006fc55	callq	*0x78(%rax)
000000000006fc58	movq	0x198(%r15), %rdi
000000000006fc5f	movq	(%rdi), %rax
000000000006fc62	movl	$0x1, %esi
000000000006fc67	movq	%r14, %rdx
000000000006fc6a	callq	*0x78(%rax)
000000000006fc6d	movq	0x198(%r15), %r15
000000000006fc74	testq	%r14, %r14
000000000006fc77	je	0x6fc82
000000000006fc79	movq	(%r14), %rax
000000000006fc7c	movq	%r14, %rdi
000000000006fc7f	callq	*0x18(%rax)
000000000006fc82	testq	%rbx, %rbx
000000000006fc85	je	0x6fc90
000000000006fc87	movq	(%rbx), %rax
000000000006fc8a	movq	%rbx, %rdi
000000000006fc8d	callq	*0x18(%rax)
000000000006fc90	movq	%r15, %rax
000000000006fc93	addq	$0x8, %rsp
000000000006fc97	popq	%rbx
000000000006fc98	popq	%r12
000000000006fc9a	popq	%r13
000000000006fc9c	popq	%r14
000000000006fc9e	popq	%r15
000000000006fca0	popq	%rbp
000000000006fca1	retq
000000000006fca2	testq	%r13, %r13
000000000006fca5	je	0x6fbab
000000000006fcab	movq	(%r13), %rax
000000000006fcaf	movq	%r13, %rdi
000000000006fcb2	callq	*0x18(%rax)
000000000006fcb5	jmp	0x6fbab
000000000006fcba	testq	%r13, %r13
000000000006fcbd	je	0x6fc46
000000000006fcbf	movq	(%r13), %rax
000000000006fcc3	movq	%r13, %rdi
000000000006fcc6	callq	*0x18(%rax)
000000000006fcc9	jmp	0x6fc46
000000000006fcce	testq	%r13, %r13
000000000006fcd1	je	0x6fbab
000000000006fcd7	movq	(%r13), %rax
000000000006fcdb	movq	%r13, %rdi
000000000006fcde	callq	*0x18(%rax)
000000000006fce1	jmp	0x6fbab
000000000006fce6	testq	%r13, %r13
000000000006fce9	je	0x6fc46
000000000006fcef	movq	(%r13), %rax
000000000006fcf3	movq	%r13, %rdi
000000000006fcf6	callq	*0x18(%rax)
000000000006fcf9	jmp	0x6fc46
000000000006fcfe	callq	__ZN8HGDither9GetOutputEP10HGRenderer.cold.1 ## HGDither::GetOutput(HGRenderer*) (.cold.1)
000000000006fd03	jmp	0x6fa73
000000000006fd08	movq	%rax, %rdi
000000000006fd0b	callq	___clang_call_terminate
000000000006fd10	movq	%rax, %rdi
000000000006fd13	callq	___clang_call_terminate
000000000006fd18	movq	%rax, %rdi
000000000006fd1b	callq	___clang_call_terminate
000000000006fd20	movq	%rax, %rdi
000000000006fd23	callq	___clang_call_terminate
000000000006fd28	movq	%rax, %r15
000000000006fd2b	testq	%r13, %r13
000000000006fd2e	je	0x6fe1e
000000000006fd34	movq	(%r13), %rax
000000000006fd38	movq	%r13, %rdi
000000000006fd3b	callq	*0x18(%rax)
000000000006fd3e	jmp	0x6fe1e
000000000006fd43	movq	%rax, %rdi
000000000006fd46	callq	___clang_call_terminate
000000000006fd4b	movq	%rax, %r15
000000000006fd4e	testq	%r13, %r13
000000000006fd51	je	0x6fe1e
000000000006fd57	movq	(%r13), %rax
000000000006fd5b	movq	%r13, %rdi
000000000006fd5e	callq	*0x18(%rax)
000000000006fd61	jmp	0x6fe1e
000000000006fd66	movq	%rax, %rdi
000000000006fd69	callq	___clang_call_terminate
000000000006fd6e	movq	%rax, %r15
000000000006fd71	testq	%r13, %r13
000000000006fd74	je	0x6fe1e
000000000006fd7a	movq	(%r13), %rax
000000000006fd7e	movq	%r13, %rdi
000000000006fd81	callq	*0x18(%rax)
000000000006fd84	jmp	0x6fe1e
000000000006fd89	movq	%rax, %rdi
000000000006fd8c	callq	___clang_call_terminate
000000000006fd91	movq	%rax, %r15
000000000006fd94	testq	%r13, %r13
000000000006fd97	je	0x6fe1e
000000000006fd9d	movq	(%r13), %rax
000000000006fda1	movq	%r13, %rdi
000000000006fda4	callq	*0x18(%rax)
000000000006fda7	jmp	0x6fe1e
000000000006fda9	movq	%rax, %rdi
000000000006fdac	callq	___clang_call_terminate
000000000006fdb1	jmp	0x6fdd3
000000000006fdb3	jmp	0x6fdd3
000000000006fdb5	jmp	0x6fdd3
000000000006fdb7	jmp	0x6fdd3
000000000006fdb9	jmp	0x6fe1b
000000000006fdbb	jmp	0x6fe1b
000000000006fdbd	jmp	0x6fe1b
000000000006fdbf	jmp	0x6fe1b
000000000006fdc1	movq	%rax, %rdi
000000000006fdc4	callq	___clang_call_terminate
000000000006fdc9	movq	%rax, %r15
000000000006fdcc	testq	%r13, %r13
000000000006fdcf	jne	0x6fe07
000000000006fdd1	jmp	0x6fe1e
000000000006fdd3	movq	%rax, %r15
000000000006fdd6	movq	%r13, %rdi
000000000006fdd9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000006fdde	jmp	0x6fe1e
000000000006fde0	jmp	0x6fe1b
000000000006fde2	movq	%rax, %rdi
000000000006fde5	callq	___clang_call_terminate
000000000006fdea	movq	%rax, %rdi
000000000006fded	callq	___clang_call_terminate
000000000006fdf2	movq	%rax, %r15
000000000006fdf5	movq	%r14, %rdi
000000000006fdf8	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000006fdfd	jmp	0x6fe2c
000000000006fdff	movq	%rax, %r15
000000000006fe02	jmp	0x6fe2c
000000000006fe04	movq	%rax, %r15
000000000006fe07	movq	(%r13), %rax
000000000006fe0b	movq	%r13, %rdi
000000000006fe0e	callq	*0x18(%rax)
000000000006fe11	jmp	0x6fe1e
000000000006fe13	movq	%rax, %rdi
000000000006fe16	callq	___clang_call_terminate
000000000006fe1b	movq	%rax, %r15
000000000006fe1e	testq	%r14, %r14
000000000006fe21	je	0x6fe2c
000000000006fe23	movq	(%r14), %rax
000000000006fe26	movq	%r14, %rdi
000000000006fe29	callq	*0x18(%rax)
000000000006fe2c	testq	%rbx, %rbx
000000000006fe2f	je	0x6fe3a
000000000006fe31	movq	(%rbx), %rax
000000000006fe34	movq	%rbx, %rdi
000000000006fe37	callq	*0x18(%rax)
000000000006fe3a	movq	%r15, %rdi
000000000006fe3d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000006fe42	movq	%rax, %rdi
000000000006fe45	callq	___clang_call_terminate
000000000006fe4a	movq	%rax, %rdi
000000000006fe4d	callq	___clang_call_terminate
000000000006fe52	nopw	%cs:(%rax,%rax)
