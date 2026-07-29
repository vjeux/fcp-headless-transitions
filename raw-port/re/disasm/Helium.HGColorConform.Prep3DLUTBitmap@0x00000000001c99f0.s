__ZN14HGColorConform15Prep3DLUTBitmapEP10HGRendererPKhmmmbNS_15hgLookLUTEndianE:
00000000001c99f0	pushq	%rbp
00000000001c99f1	movq	%rsp, %rbp
00000000001c99f4	pushq	%r15
00000000001c99f6	pushq	%r14
00000000001c99f8	pushq	%r13
00000000001c99fa	pushq	%r12
00000000001c99fc	pushq	%rbx
00000000001c99fd	subq	$0x58, %rsp
00000000001c9a01	movq	%r9, -0x68(%rbp)
00000000001c9a05	movq	%r8, %r15
00000000001c9a08	movq	%rcx, %r13
00000000001c9a0b	movq	%rdx, -0x78(%rbp)
00000000001c9a0f	movq	%rsi, -0x70(%rbp)
00000000001c9a13	movq	%rdi, %rbx
00000000001c9a16	movzbl	__ZGVZN14HGColorConform15Prep3DLUTBitmapEP10HGRendererPKhmmmbNS_15hgLookLUTEndianEE10lutFactory(%rip), %eax ## guard variable for HGColorConform::Prep3DLUTBitmap(HGRenderer*, unsigned char const*, unsigned long, unsigned long, unsigned long, bool, HGColorConform::hgLookLUTEndian)::lutFactory
00000000001c9a1d	testb	%al, %al
00000000001c9a1f	je	0x1c9cd8
00000000001c9a25	movl	$0x50, %edi
00000000001c9a2a	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001c9a2f	movq	%rax, -0x60(%rbp)
00000000001c9a33	movq	0x218(%rbx), %r12
00000000001c9a3a	xorps	%xmm0, %xmm0
00000000001c9a3d	movaps	%xmm0, -0x50(%rbp)
00000000001c9a41	movq	$0x0, -0x40(%rbp)
00000000001c9a49	movq	0x40(%r12), %rax
00000000001c9a4e	movq	0x48(%r12), %r14
00000000001c9a53	subq	%rax, %r14
00000000001c9a56	je	0x1c9a8b
00000000001c9a58	js	0x1c9ce2
00000000001c9a5e	movq	%rax, -0x30(%rbp)
00000000001c9a62	movq	%r14, %rdi
00000000001c9a65	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001c9a6a	movq	%rax, -0x50(%rbp)
00000000001c9a6e	movq	%rax, %rbx
00000000001c9a71	addq	%r14, %rbx
00000000001c9a74	movq	%rbx, -0x40(%rbp)
00000000001c9a78	movq	%rax, %rdi
00000000001c9a7b	movq	-0x30(%rbp), %rsi
00000000001c9a7f	movq	%r14, %rdx
00000000001c9a82	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001c9a87	movq	%rbx, -0x48(%rbp)
00000000001c9a8b	movss	0x18(%r12), %xmm0
00000000001c9a92	movss	0x1c(%r12), %xmm1
00000000001c9a99	leaq	-0x50(%rbp), %rcx
00000000001c9a9d	movl	$0x3, %edx
00000000001c9aa2	movq	-0x60(%rbp), %rbx
00000000001c9aa6	movq	%rbx, %rdi
00000000001c9aa9	movq	%r13, %rsi
00000000001c9aac	xorl	%r8d, %r8d
00000000001c9aaf	callq	__ZN21HGColorConformLUTInfoC2EmmNSt3__16vectorIhNS0_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGColorConformLUTInfo::HGColorConformLUTInfo(unsigned long, unsigned long, std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001c9ab4	movq	-0x50(%rbp), %rdi
00000000001c9ab8	testq	%rdi, %rdi
00000000001c9abb	je	0x1c9ac6
00000000001c9abd	movq	%rdi, -0x48(%rbp)
00000000001c9ac1	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001c9ac6	movq	-0x70(%rbp), %rax
00000000001c9aca	movq	0x228(%rax), %rdi
00000000001c9ad1	leaq	__ZZN14HGColorConform15Prep3DLUTBitmapEP10HGRendererPKhmmmbNS_15hgLookLUTEndianEE10lutFactory(%rip), %rsi ## HGColorConform::Prep3DLUTBitmap(HGRenderer*, unsigned char const*, unsigned long, unsigned long, unsigned long, bool, HGColorConform::hgLookLUTEndian)::lutFactory
00000000001c9ad8	callq	__ZN17HGLUTCacheManager11getLUTCacheEPN10HGLUTCache15LUTEntryFactoryE ## HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*)
00000000001c9add	movq	%rax, %r14
00000000001c9ae0	movq	%rax, %rdi
00000000001c9ae3	movq	%rbx, %rsi
00000000001c9ae6	callq	__ZN10HGLUTCache11isLUTCachedEPNS_7LUTInfoE ## HGLUTCache::isLUTCached(HGLUTCache::LUTInfo*)
00000000001c9aeb	testb	%al, %al
00000000001c9aed	je	0x1c9b0b
00000000001c9aef	movq	%r14, %rdi
00000000001c9af2	movq	%rbx, %rsi
00000000001c9af5	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
00000000001c9afa	movq	%rax, %r14
00000000001c9afd	movq	(%rbx), %rax
00000000001c9b00	movq	%rbx, %rdi
00000000001c9b03	callq	*0x8(%rax)
00000000001c9b06	jmp	0x1c9cc6
00000000001c9b0b	movq	%r14, -0x80(%rbp)
00000000001c9b0f	movl	$0x28, %edi
00000000001c9b14	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c9b19	movq	%rax, %r12
00000000001c9b1c	movq	%rax, %rdi
00000000001c9b1f	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001c9b24	movq	%r13, %rax
00000000001c9b27	imulq	%r13, %rax
00000000001c9b2b	movq	%rax, -0x30(%rbp)
00000000001c9b2f	imulq	%r13, %rax
00000000001c9b33	addq	%rax, %rax
00000000001c9b36	leaq	(%rax,%rax,2), %rdi
00000000001c9b3a	leaq	0x860437(%rip), %rax
00000000001c9b41	movq	%rax, (%r12)
00000000001c9b45	movq	%rdi, 0x10(%r12)
00000000001c9b4a	movl	$0x13, 0x20(%r12)
00000000001c9b53	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000001c9b58	movq	%rax, 0x18(%r12)
00000000001c9b5d	movq	(%r12), %rax
00000000001c9b61	movq	%r12, %rdi
00000000001c9b64	movq	%r12, -0x58(%rbp)
00000000001c9b68	callq	*0x10(%rax)
00000000001c9b6b	movq	0x28(%rbx), %rdi
00000000001c9b6f	cmpq	%r12, %rdi
00000000001c9b72	je	0x1c9b8d
00000000001c9b74	testq	%rdi, %rdi
00000000001c9b77	je	0x1c9b7f
00000000001c9b79	movq	(%rdi), %rax
00000000001c9b7c	callq	*0x18(%rax)
00000000001c9b7f	movq	%r12, 0x28(%rbx)
00000000001c9b83	movq	(%r12), %rax
00000000001c9b87	movq	%r12, %rdi
00000000001c9b8a	callq	*0x10(%rax)
00000000001c9b8d	movq	(%r12), %rax
00000000001c9b91	movq	%r12, %rdi
00000000001c9b94	callq	*0x18(%rax)
00000000001c9b97	movl	$0x13, %edi
00000000001c9b9c	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000001c9ba1	movl	%eax, %r14d
00000000001c9ba4	movl	$0x13, %edi
00000000001c9ba9	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000001c9bae	cmpb	$0x0, 0x10(%rbp)
00000000001c9bb2	movl	%r14d, %edx
00000000001c9bb5	movq	%rdx, %rcx
00000000001c9bb8	movq	-0x68(%rbp), %rsi
00000000001c9bbc	cmovneq	%rsi, %rcx
00000000001c9bc0	cmovneq	%rdx, %rsi
00000000001c9bc4	movq	%rsi, -0x68(%rbp)
00000000001c9bc8	testq	%r13, %r13
00000000001c9bcb	movq	-0x78(%rbp), %r9
00000000001c9bcf	je	0x1c9ca0
00000000001c9bd5	movl	0x18(%rbp), %edx
00000000001c9bd8	movl	%eax, %eax
00000000001c9bda	movq	%r13, %rsi
00000000001c9bdd	imulq	%rax, %rsi
00000000001c9be1	movq	-0x58(%rbp), %rdi
00000000001c9be5	movq	0x18(%rdi), %r10
00000000001c9be9	movq	-0x30(%rbp), %rdi
00000000001c9bed	imulq	%rax, %rdi
00000000001c9bf1	movq	%rdi, -0x30(%rbp)
00000000001c9bf5	addq	$0x4, %r9
00000000001c9bf9	xorl	%r8d, %r8d
00000000001c9bfc	jmp	0x1c9c1c
00000000001c9bfe	nop
00000000001c9c00	incq	%r8
00000000001c9c03	movq	-0x70(%rbp), %r10
00000000001c9c07	addq	-0x30(%rbp), %r10
00000000001c9c0b	movq	-0x78(%rbp), %r9
00000000001c9c0f	addq	-0x68(%rbp), %r9
00000000001c9c13	cmpq	%r13, %r8
00000000001c9c16	je	0x1c9ca0
00000000001c9c1c	movq	%r9, -0x78(%rbp)
00000000001c9c20	movq	%r10, -0x70(%rbp)
00000000001c9c24	movq	%r10, %rdi
00000000001c9c27	xorl	%r11d, %r11d
00000000001c9c2a	jmp	0x1c9c3e
00000000001c9c2c	nopl	(%rax)
00000000001c9c30	incq	%r11
00000000001c9c33	addq	%rsi, %rdi
00000000001c9c36	addq	%r15, %r9
00000000001c9c39	cmpq	%r13, %r11
00000000001c9c3c	je	0x1c9c00
00000000001c9c3e	movq	%r9, %r14
00000000001c9c41	movq	%rdi, %r10
00000000001c9c44	movq	%r13, %r12
00000000001c9c47	jmp	0x1c9c72
00000000001c9c49	nopl	(%rax)
00000000001c9c50	movw	%bx, (%r10)
00000000001c9c54	movzwl	-0x2(%r14), %ebx
00000000001c9c59	movw	%bx, 0x2(%r10)
00000000001c9c5e	movzwl	(%r14), %ebx
00000000001c9c62	movw	%bx, 0x4(%r10)
00000000001c9c67	addq	%rax, %r10
00000000001c9c6a	addq	%rcx, %r14
00000000001c9c6d	decq	%r12
00000000001c9c70	je	0x1c9c30
00000000001c9c72	movzwl	-0x4(%r14), %ebx
00000000001c9c77	testl	%edx, %edx
00000000001c9c79	je	0x1c9c50
00000000001c9c7b	cmpl	$0x1, %edx
00000000001c9c7e	jne	0x1c9c50
00000000001c9c80	rolw	$0x8, %bx
00000000001c9c84	movw	%bx, (%r10)
00000000001c9c88	movzwl	-0x2(%r14), %ebx
00000000001c9c8d	rolw	$0x8, %bx
00000000001c9c91	movw	%bx, 0x2(%r10)
00000000001c9c96	movzwl	(%r14), %ebx
00000000001c9c9a	rolw	$0x8, %bx
00000000001c9c9e	jmp	0x1c9c62
00000000001c9ca0	movq	-0x80(%rbp), %rdi
00000000001c9ca4	movq	-0x60(%rbp), %rbx
00000000001c9ca8	movq	%rbx, %rsi
00000000001c9cab	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
00000000001c9cb0	movq	%rax, %r14
00000000001c9cb3	movq	(%rbx), %rax
00000000001c9cb6	movq	%rbx, %rdi
00000000001c9cb9	callq	*0x8(%rax)
00000000001c9cbc	movq	-0x58(%rbp), %rdi
00000000001c9cc0	movq	(%rdi), %rax
00000000001c9cc3	callq	*0x18(%rax)
00000000001c9cc6	movq	%r14, %rax
00000000001c9cc9	addq	$0x58, %rsp
00000000001c9ccd	popq	%rbx
00000000001c9cce	popq	%r12
00000000001c9cd0	popq	%r13
00000000001c9cd2	popq	%r14
00000000001c9cd4	popq	%r15
00000000001c9cd6	popq	%rbp
00000000001c9cd7	retq
00000000001c9cd8	callq	__ZN14HGColorConform15Prep3DLUTBitmapEP10HGRendererPKhmmmbNS_15hgLookLUTEndianE.cold.1 ## HGColorConform::Prep3DLUTBitmap(HGRenderer*, unsigned char const*, unsigned long, unsigned long, unsigned long, bool, HGColorConform::hgLookLUTEndian) (.cold.1)
00000000001c9cdd	jmp	0x1c9a25
00000000001c9ce2	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001c9ce7	ud2
00000000001c9ce9	movq	%rax, %rdi
00000000001c9cec	callq	___clang_call_terminate
00000000001c9cf1	jmp	0x1c9cff
00000000001c9cf3	jmp	0x1c9cff
00000000001c9cf5	jmp	0x1c9cff
00000000001c9cf7	movq	%rax, %rdi
00000000001c9cfa	callq	___clang_call_terminate
00000000001c9cff	movq	%rax, %r14
00000000001c9d02	movq	-0x58(%rbp), %rdi
00000000001c9d06	movq	(%rdi), %rax
00000000001c9d09	callq	*0x18(%rax)
00000000001c9d0c	jmp	0x1c9d81
00000000001c9d0e	movq	%rax, %r14
00000000001c9d11	movq	%r12, %rbx
00000000001c9d14	movq	%r12, %rdi
00000000001c9d17	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001c9d1c	movq	%rbx, %rdi
00000000001c9d1f	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c9d24	movq	%r14, %rdi
00000000001c9d27	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c9d2c	movq	%r12, %rbx
00000000001c9d2f	movq	%rax, %r14
00000000001c9d32	movq	%rbx, %rdi
00000000001c9d35	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c9d3a	movq	%r14, %rdi
00000000001c9d3d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c9d42	movq	%rax, %r14
00000000001c9d45	movq	(%r12), %rax
00000000001c9d49	movq	%r12, %rdi
00000000001c9d4c	callq	*0x18(%rax)
00000000001c9d4f	jmp	0x1c9d02
00000000001c9d51	movq	%rax, %rdi
00000000001c9d54	callq	___clang_call_terminate
00000000001c9d59	jmp	0x1c9d63
00000000001c9d5b	movq	%rax, %rdi
00000000001c9d5e	callq	___clang_call_terminate
00000000001c9d63	movq	%rax, %r14
00000000001c9d66	movq	-0x50(%rbp), %rdi
00000000001c9d6a	testq	%rdi, %rdi
00000000001c9d6d	je	0x1c9d78
00000000001c9d6f	movq	%rdi, -0x48(%rbp)
00000000001c9d73	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001c9d78	movq	-0x60(%rbp), %rdi
00000000001c9d7c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001c9d81	movq	%r14, %rdi
00000000001c9d84	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c9d89	nopl	(%rax)
