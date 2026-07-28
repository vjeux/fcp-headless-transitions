__ZN17HGApplyNDLUTEntry9GetBitmapEv:
000000000003e240	pushq	%rbp
000000000003e241	movq	%rsp, %rbp
000000000003e244	pushq	%r15
000000000003e246	pushq	%r14
000000000003e248	pushq	%rbx
000000000003e249	subq	$0x18, %rsp
000000000003e24d	movq	%rdi, %rbx
000000000003e250	movq	0x10(%rdi), %rdi
000000000003e254	testq	%rdi, %rdi
000000000003e257	je	0x3e31d
000000000003e25d	movq	(%rdi), %rax
000000000003e260	callq	*0x130(%rax)
000000000003e266	testb	%al, %al
000000000003e268	jne	0x3e31d
000000000003e26e	movq	0x10(%rbx), %r15
000000000003e272	testq	%r15, %r15
000000000003e275	je	0x3e294
000000000003e277	leaq	__ZTI10HGRenderer(%rip), %rsi   ## typeinfo for HGRenderer
000000000003e27e	leaq	__ZTI13HGGPURenderer(%rip), %rdx ## typeinfo for HGGPURenderer
000000000003e285	movq	%r15, %rdi
000000000003e288	xorl	%ecx, %ecx
000000000003e28a	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
000000000003e28f	movq	%rax, %r14
000000000003e292	jmp	0x3e297
000000000003e294	xorl	%r14d, %r14d
000000000003e297	movq	(%r15), %rax
000000000003e29a	movq	%r15, %rdi
000000000003e29d	movl	$0x2b, %esi
000000000003e2a2	callq	*0x80(%rax)
000000000003e2a8	cmpl	$0x1, %eax
000000000003e2ab	jne	0x3e31d
000000000003e2ad	leaq	0x20(%rbx), %r15
000000000003e2b1	movq	0x20(%rbx), %rdi
000000000003e2b5	testq	%rdi, %rdi
000000000003e2b8	jne	0x3e354
000000000003e2be	movq	%r14, %rdi
000000000003e2c1	callq	__ZN13HGGPURenderer15GetMetalContextEv ## HGGPURenderer::GetMetalContext()
000000000003e2c6	movq	0x10(%rax), %rax
000000000003e2ca	movq	0x10(%rax), %rsi
000000000003e2ce	movq	0x18(%rbx), %rcx
000000000003e2d2	movq	0x14(%rcx), %r8
000000000003e2d6	movq	0x1c(%rcx), %r9
000000000003e2da	movl	$0x0, 0x8(%rsp)
000000000003e2e2	movl	$0x0, (%rsp)
000000000003e2e9	leaq	-0x20(%rbp), %rdi
000000000003e2ed	xorl	%edx, %edx
000000000003e2ef	callq	__ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb ## HGMetalTexture::createWithCopy(HGMTLDeviceType, HGMetalTexturePool*, HGBitmap*, HGRect, bool, bool)
000000000003e2f4	movq	0x20(%rbx), %rax
000000000003e2f8	movq	-0x20(%rbp), %rdi
000000000003e2fc	cmpq	%rdi, %rax
000000000003e2ff	je	0x3e341
000000000003e301	testq	%rax, %rax
000000000003e304	je	0x3e313
000000000003e306	movq	(%rax), %rcx
000000000003e309	movq	%rax, %rdi
000000000003e30c	callq	*0x18(%rcx)
000000000003e30f	movq	-0x20(%rbp), %rdi
000000000003e313	movq	%rdi, (%r15)
000000000003e316	testq	%rdi, %rdi
000000000003e319	jne	0x3e354
000000000003e31b	jmp	0x3e333
000000000003e31d	movq	0x18(%rbx), %rdi
000000000003e321	addq	$0x18, %rbx
000000000003e325	testq	%rdi, %rdi
000000000003e328	je	0x3e330
000000000003e32a	movq	(%rdi), %rax
000000000003e32d	callq	*0x10(%rax)
000000000003e330	movq	%rbx, %r15
000000000003e333	movq	(%r15), %rax
000000000003e336	addq	$0x18, %rsp
000000000003e33a	popq	%rbx
000000000003e33b	popq	%r14
000000000003e33d	popq	%r15
000000000003e33f	popq	%rbp
000000000003e340	retq
000000000003e341	testq	%rax, %rax
000000000003e344	je	0x3e333
000000000003e346	movq	(%rdi), %rax
000000000003e349	callq	*0x18(%rax)
000000000003e34c	movq	(%r15), %rdi
000000000003e34f	testq	%rdi, %rdi
000000000003e352	je	0x3e333
000000000003e354	movq	(%rdi), %rax
000000000003e357	callq	*0x10(%rax)
000000000003e35a	jmp	0x3e333
000000000003e35c	movq	%rax, %rdi
000000000003e35f	callq	___clang_call_terminate
000000000003e364	movq	%rax, %rbx
000000000003e367	movq	-0x20(%rbp), %rdi
000000000003e36b	testq	%rdi, %rdi
000000000003e36e	je	0x3e376
000000000003e370	movq	(%rdi), %rax
000000000003e373	callq	*0x18(%rax)
000000000003e376	movq	%rbx, %rdi
000000000003e379	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003e37e	movq	%rax, %rdi
000000000003e381	callq	___clang_call_terminate
000000000003e386	nopw	%cs:(%rax,%rax)
