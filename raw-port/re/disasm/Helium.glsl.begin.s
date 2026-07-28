__ZN4glslL5beginER8string_tRK8HGLimitsS4_:
00000000000c0cc0	pushq	%rbp
00000000000c0cc1	movq	%rsp, %rbp
00000000000c0cc4	pushq	%r15
00000000000c0cc6	pushq	%r14
00000000000c0cc8	pushq	%r12
00000000000c0cca	pushq	%rbx
00000000000c0ccb	movq	%rdx, %r14
00000000000c0cce	movq	%rsi, %r15
00000000000c0cd1	movq	%rdi, %rbx
00000000000c0cd4	movl	(%rdx), %r12d
00000000000c0cd7	movq	0x8(%rdi), %rsi
00000000000c0cdb	testq	%rsi, %rsi
00000000000c0cde	je	0xc0cf5
00000000000c0ce0	movq	%rbx, %rdi
00000000000c0ce3	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c0ce8	movl	(%r15), %eax
00000000000c0ceb	cmpl	(%r14), %eax
00000000000c0cee	jne	0xc0d16
00000000000c0cf0	jmp	0xc0dfc
00000000000c0cf5	movl	$0x21, %esi
00000000000c0cfa	movq	%rbx, %rdi
00000000000c0cfd	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c0d02	movq	$0x21, 0x8(%rbx)
00000000000c0d0a	movl	(%r15), %eax
00000000000c0d0d	cmpl	(%r14), %eax
00000000000c0d10	je	0xc0dfc
00000000000c0d16	movq	(%rbx), %rdi
00000000000c0d19	movl	%r12d, %eax
00000000000c0d1c	andl	$__ZN5HGHLG11InverseOETFD0Ev, %eax ## HGHLG::InverseOETF::~InverseOETF()
00000000000c0d21	cmpl	$0x605ff, %eax                  ## imm = 0x605FF
00000000000c0d26	jg	0xc0d49
00000000000c0d28	cmpl	$0x20600, %eax                  ## imm = 0x20600
00000000000c0d2d	je	0xc0d70
00000000000c0d2f	cmpl	$0x50600, %eax                  ## imm = 0x50600
00000000000c0d34	je	0xc0d8c
00000000000c0d36	cmpl	$0x50700, %eax                  ## imm = 0x50700
00000000000c0d3b	jne	0xc0dfc
00000000000c0d41	movw	$0x7376, 0x4(%rdi)              ## imm = 0x7376
00000000000c0d47	jmp	0xc0da0
00000000000c0d49	cmpl	$0x60600, %eax                  ## imm = 0x60600
00000000000c0d4e	je	0xc0d7e
00000000000c0d50	cmpl	$0x60700, %eax                  ## imm = 0x60700
00000000000c0d55	je	0xc0d9a
00000000000c0d57	cmpl	$0x70600, %eax                  ## imm = 0x70600
00000000000c0d5c	jne	0xc0dfc
00000000000c0d62	movw	$0x7375, 0x4(%rdi)              ## imm = 0x7375
00000000000c0d68	movl	$0x4c472f2f, (%rdi)             ## imm = 0x4C472F2F
00000000000c0d6e	jmp	0xc0da6
00000000000c0d70	movw	$0x7370, 0x4(%rdi)              ## imm = 0x7370
00000000000c0d76	movl	$0x4c472f2f, (%rdi)             ## imm = 0x4C472F2F
00000000000c0d7c	jmp	0xc0da6
00000000000c0d7e	movw	$0x7366, 0x4(%rdi)              ## imm = 0x7366
00000000000c0d84	movl	$0x4c472f2f, (%rdi)             ## imm = 0x4C472F2F
00000000000c0d8a	jmp	0xc0da6
00000000000c0d8c	movw	$0x7376, 0x4(%rdi)              ## imm = 0x7376
00000000000c0d92	movl	$0x4c472f2f, (%rdi)             ## imm = 0x4C472F2F
00000000000c0d98	jmp	0xc0da6
00000000000c0d9a	movw	$0x7366, 0x4(%rdi)              ## imm = 0x7366
00000000000c0da0	movl	$0x47432f2f, (%rdi)             ## imm = 0x47432F2F
00000000000c0da6	movl	%r12d, %eax
00000000000c0da9	shrl	$0x4, %eax
00000000000c0dac	andl	$0xf, %eax
00000000000c0daf	andl	$0xf, %r12d
00000000000c0db3	movl	%eax, %ecx
00000000000c0db5	orl	%r12d, %ecx
00000000000c0db8	je	0xc0dd1
00000000000c0dba	orb	$0x30, %al
00000000000c0dbc	movb	%al, 0x6(%rdi)
00000000000c0dbf	movb	$0x2e, 0x7(%rdi)
00000000000c0dc3	orb	$0x30, %r12b
00000000000c0dc7	movb	%r12b, 0x8(%rdi)
00000000000c0dcb	addq	$0x9, %rdi
00000000000c0dcf	jmp	0xc0dd5
00000000000c0dd1	addq	$0x6, %rdi
00000000000c0dd5	movq	(%rbx), %rbx
00000000000c0dd8	leaq	0xf(%rbx), %rdx
00000000000c0ddc	subq	%rdi, %rdx
00000000000c0ddf	movl	$0x20, %esi
00000000000c0de4	callq	0x3c5444                        ## symbol stub for: _memset
00000000000c0de9	movb	$0xa, 0xf(%rbx)
00000000000c0ded	movups	0x81b73d(%rip), %xmm0           ## literal pool for: "//LEN=0000000000\n"
00000000000c0df4	movups	%xmm0, 0x10(%rbx)
00000000000c0df8	movb	$0xa, 0x20(%rbx)
00000000000c0dfc	popq	%rbx
00000000000c0dfd	popq	%r12
00000000000c0dff	popq	%r14
00000000000c0e01	popq	%r15
00000000000c0e03	popq	%rbp
00000000000c0e04	retq
00000000000c0e05	nopw	%cs:(%rax,%rax)
