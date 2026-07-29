__ZN12HGDenoisePDE9GetOutputEP10HGRenderer:
00000000001c3250	pushq	%rbp
00000000001c3251	movq	%rsp, %rbp
00000000001c3254	pushq	%r14
00000000001c3256	pushq	%rbx
00000000001c3257	movq	%rdi, %rbx
00000000001c325a	movq	0x198(%rdi), %r14
00000000001c3261	movq	%rsi, %rdi
00000000001c3264	movq	%rbx, %rsi
00000000001c3267	xorl	%edx, %edx
00000000001c3269	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001c326e	movq	(%r14), %rcx
00000000001c3271	movq	%r14, %rdi
00000000001c3274	xorl	%esi, %esi
00000000001c3276	movq	%rax, %rdx
00000000001c3279	callq	*0x78(%rcx)
00000000001c327c	movq	0x1b8(%rbx), %rdi
00000000001c3283	movq	(%rdi), %rax
00000000001c3286	movss	0x20705e(%rip), %xmm0
00000000001c328e	xorps	%xmm2, %xmm2
00000000001c3291	xorps	%xmm3, %xmm3
00000000001c3294	xorl	%esi, %esi
00000000001c3296	movaps	%xmm0, %xmm1
00000000001c3299	callq	*0x60(%rax)
00000000001c329c	movq	0x1c0(%rbx), %rdi
00000000001c32a3	movss	0x1c8(%rbx), %xmm0
00000000001c32ab	movq	(%rdi), %rax
00000000001c32ae	xorl	%esi, %esi
00000000001c32b0	movaps	%xmm0, %xmm1
00000000001c32b3	movaps	%xmm0, %xmm2
00000000001c32b6	movaps	%xmm0, %xmm3
00000000001c32b9	callq	*0x60(%rax)
00000000001c32bc	movq	0x1c0(%rbx), %rax
00000000001c32c3	popq	%rbx
00000000001c32c4	popq	%r14
00000000001c32c6	popq	%rbp
00000000001c32c7	retq
00000000001c32c8	nopl	(%rax,%rax)
