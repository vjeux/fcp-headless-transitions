__ZNK19HGProgramDescriptor24EncodeShaderBufferStructERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
0000000000168850	pushq	%rbp
0000000000168851	movq	%rsp, %rbp
0000000000168854	pushq	%r14
0000000000168856	pushq	%rbx
0000000000168857	subq	$0x10, %rsp
000000000016885b	movq	%rsi, %rbx
000000000016885e	movzbl	0x40(%rdi), %eax
0000000000168862	testb	$0x1, %al
0000000000168864	jne	0x168886
0000000000168866	shrl	%eax
0000000000168868	movzbl	0x58(%rdi), %ecx
000000000016886c	testb	$0x1, %cl
000000000016886f	je	0x168893
0000000000168871	movq	0x60(%rdi), %rcx
0000000000168875	movb	$0x1, %dl
0000000000168877	testq	%rcx, %rcx
000000000016887a	je	0x16889c
000000000016887c	testq	%rax, %rax
000000000016887f	jne	0x1688be
0000000000168881	jmp	0x16891b
0000000000168886	movq	0x48(%rdi), %rax
000000000016888a	movzbl	0x58(%rdi), %ecx
000000000016888e	testb	$0x1, %cl
0000000000168891	jne	0x168871
0000000000168893	shrl	%ecx
0000000000168895	movb	$0x1, %dl
0000000000168897	testq	%rcx, %rcx
000000000016889a	jne	0x16887c
000000000016889c	movzbl	0xa0(%rdi), %ecx
00000000001688a3	testb	$0x1, %cl
00000000001688a6	jne	0x1688ac
00000000001688a8	shrl	%ecx
00000000001688aa	jmp	0x1688b3
00000000001688ac	movq	0xa8(%rdi), %rcx
00000000001688b3	testq	%rcx, %rcx
00000000001688b6	setne	%dl
00000000001688b9	testq	%rax, %rax
00000000001688bc	je	0x16891b
00000000001688be	testb	%dl, %dl
00000000001688c0	je	0x16891b
00000000001688c2	movq	(%rbx), %rax
00000000001688c5	andq	$-0x2, %rax
00000000001688c9	addq	$0xff, %rax
00000000001688cf	testb	$0x1, (%rbx)
00000000001688d2	movl	$0x116, %esi                    ## imm = 0x116
00000000001688d7	cmovneq	%rax, %rsi
00000000001688db	movq	%rdi, %r14
00000000001688de	movq	%rbx, %rdi
00000000001688e1	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
00000000001688e6	leaq	0x78278a(%rip), %rsi            ## literal pool for: "struct ShaderParameters {\n"
00000000001688ed	movq	%rbx, %rdi
00000000001688f0	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001688f5	movq	$0x0, -0x18(%rbp)
00000000001688fd	leaq	-0x18(%rbp), %rdx
0000000000168901	movq	%r14, %rdi
0000000000168904	movq	%rbx, %rsi
0000000000168907	callq	__ZNK19HGProgramDescriptor31privateEncodeShaderBufferStructERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERm ## HGProgramDescriptor::privateEncodeShaderBufferStruct(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&, unsigned long&) const
000000000016890c	leaq	0x78277f(%rip), %rsi            ## literal pool for: "};\n"
0000000000168913	movq	%rbx, %rdi
0000000000168916	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016891b	addq	$0x10, %rsp
000000000016891f	popq	%rbx
0000000000168920	popq	%r14
0000000000168922	popq	%rbp
0000000000168923	retq
0000000000168924	nopw	%cs:(%rax,%rax)
