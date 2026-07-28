__ZN13LiImageFilterC2ERKS_:
000000000009b0cc	pushq	%rbp
000000000009b0cd	movq	%rsp, %rbp
000000000009b0d0	pushq	%r15
000000000009b0d2	pushq	%r14
000000000009b0d4	pushq	%r12
000000000009b0d6	pushq	%rbx
000000000009b0d7	movq	%rdx, %r15
000000000009b0da	movq	%rsi, %r12
000000000009b0dd	movq	%rdi, %rbx
000000000009b0e0	leaq	0x8(%rsi), %r14
000000000009b0e4	movq	%r14, %rsi
000000000009b0e7	callq	__ZN13LiImageSourceC2Ev         ## LiImageSource::LiImageSource()
000000000009b0ec	movq	(%r12), %rax
000000000009b0f0	movq	%rax, (%rbx)
000000000009b0f3	movq	0x28(%r12), %rcx
000000000009b0f8	movq	-0x18(%rax), %rax
000000000009b0fc	movq	%rcx, (%rbx,%rax)
000000000009b100	movq	0x10(%r15), %rax
000000000009b104	movq	%rax, 0x10(%rbx)
000000000009b108	leaq	0x18(%rbx), %rdi
000000000009b10c	leaq	0x18(%r15), %rsi
000000000009b110	callq	0x1c4336                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000009b115	movl	0x20(%r15), %eax
000000000009b119	movl	%eax, 0x20(%rbx)
000000000009b11c	popq	%rbx
000000000009b11d	popq	%r12
000000000009b11f	popq	%r14
000000000009b121	popq	%r15
000000000009b123	popq	%rbp
000000000009b124	retq
000000000009b125	movq	%rax, %r15
000000000009b128	movq	%rbx, %rdi
000000000009b12b	movq	%r14, %rsi
000000000009b12e	callq	__ZN13LiImageSourceD2Ev         ## LiImageSource::~LiImageSource()
000000000009b133	movq	%r15, %rdi
000000000009b136	callq	0x1c40c6                        ## symbol stub for: __Unwind_Resume
000000000009b13b	nop
