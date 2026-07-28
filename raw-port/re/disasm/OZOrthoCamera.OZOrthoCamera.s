__ZN13OZOrthoCameraC1EiRK9PCVector2IdE:
000000000003ad70	pushq	%rbp
000000000003ad71	movq	%rsp, %rbp
000000000003ad74	pushq	%r15
000000000003ad76	pushq	%r14
000000000003ad78	pushq	%r12
000000000003ad7a	pushq	%rbx
000000000003ad7b	movq	%rdx, %r15
000000000003ad7e	movl	%esi, %r12d
000000000003ad81	movq	%rdi, %rbx
000000000003ad84	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
000000000003ad8b	addq	$0x10, %rax
000000000003ad8f	movq	%rax, 0x240(%rdi)
000000000003ad96	movq	$0x0, 0x248(%rdi)
000000000003ada1	leaq	__ZTT13OZOrthoCamera(%rip), %r14 ## VTT for OZOrthoCamera
000000000003ada8	addq	$0x8, %r14
000000000003adac	movq	%r14, %rsi
000000000003adaf	callq	0x6ddc62                        ## symbol stub for: __ZN14LiSimpleCameraC2Ev
000000000003adb4	leaq	__ZTV13OZOrthoCamera(%rip), %rax ## vtable for OZOrthoCamera
000000000003adbb	leaq	0x18(%rax), %rcx
000000000003adbf	movq	%rcx, (%rbx)
000000000003adc2	addq	$0x3f0, %rax                    ## imm = 0x3F0
000000000003adc8	movq	%rax, 0x240(%rbx)
000000000003adcf	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000003add9	movq	%rax, 0x208(%rbx)
000000000003ade0	xorps	%xmm0, %xmm0
000000000003ade3	movups	%xmm0, 0x210(%rbx)
000000000003adea	movq	$0x0, 0x220(%rbx)
000000000003adf5	movl	%r12d, 0x228(%rbx)
000000000003adfc	movups	(%r15), %xmm0
000000000003ae00	movups	%xmm0, 0x230(%rbx)
000000000003ae07	movq	%rbx, %rdi
000000000003ae0a	movl	$0x1, %esi
000000000003ae0f	callq	0x6ddc4a                        ## symbol stub for: __ZN14LiSimpleCamera14setCameraModelE13LiCameraModel
000000000003ae14	movq	(%rbx), %rax
000000000003ae17	xorps	%xmm0, %xmm0
000000000003ae1a	movq	%rbx, %rdi
000000000003ae1d	callq	*0x200(%rax)
000000000003ae23	movq	(%rbx), %rax
000000000003ae26	movq	%rbx, %rdi
000000000003ae29	movq	%r15, %rsi
000000000003ae2c	callq	*0x120(%rax)
000000000003ae32	movq	(%rbx), %rax
000000000003ae35	movq	%rbx, %rdi
000000000003ae38	callq	*0x3a0(%rax)
000000000003ae3e	popq	%rbx
000000000003ae3f	popq	%r12
000000000003ae41	popq	%r14
000000000003ae43	popq	%r15
000000000003ae45	popq	%rbp
000000000003ae46	retq
000000000003ae47	movq	%rax, %r15
000000000003ae4a	jmp	0x3ae5a
000000000003ae4c	movq	%rax, %r15
000000000003ae4f	movq	%rbx, %rdi
000000000003ae52	movq	%r14, %rsi
000000000003ae55	callq	0x6ddc6e                        ## symbol stub for: __ZN14LiSimpleCameraD2Ev
000000000003ae5a	addq	$0x240, %rbx                    ## imm = 0x240
000000000003ae61	movq	%rbx, %rdi
000000000003ae64	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
000000000003ae69	movq	%r15, %rdi
000000000003ae6c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000003ae71	nopw	%cs:(%rax,%rax)
