__ZN17ApplyReflectivity9writeHashER17PCHashWriteStream:
00000000001e1c00	pushq	%rbp
00000000001e1c01	movq	%rsp, %rbp
00000000001e1c04	pushq	%r14
00000000001e1c06	pushq	%rbx
00000000001e1c07	movq	%rsi, %rbx
00000000001e1c0a	movq	%rdi, %r14
00000000001e1c0d	callq	0x6de7a2                        ## symbol stub for: __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
00000000001e1c12	movq	0x10(%r14), %rdi
00000000001e1c16	testq	%rdi, %rdi
00000000001e1c19	je	0x1e1c2b
00000000001e1c1b	movq	(%rdi), %rax
00000000001e1c1e	movq	0x20(%rax), %rax
00000000001e1c22	movq	%rbx, %rsi
00000000001e1c25	popq	%rbx
00000000001e1c26	popq	%r14
00000000001e1c28	popq	%rbp
00000000001e1c29	jmpq	*%rax
00000000001e1c2b	popq	%rbx
00000000001e1c2c	popq	%r14
00000000001e1c2e	popq	%rbp
00000000001e1c2f	retq
