__ZNK19HGProgramDescriptor19EncodeShaderProgramERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
000000000016cea0	pushq	%rbp
000000000016cea1	movq	%rsp, %rbp
000000000016cea4	pushq	%r14
000000000016cea6	pushq	%rbx
000000000016cea7	subq	$0x30, %rsp
000000000016ceab	movq	%rdi, %rbx
000000000016ceae	movzbl	0x40(%rdi), %eax
000000000016ceb2	testb	$0x1, %al
000000000016ceb4	jne	0x16ced6
000000000016ceb6	shrl	%eax
000000000016ceb8	movzbl	0x58(%rbx), %ecx
000000000016cebc	testb	$0x1, %cl
000000000016cebf	je	0x16cee3
000000000016cec1	movq	0x60(%rbx), %rcx
000000000016cec5	movb	$0x1, %dl
000000000016cec7	testq	%rcx, %rcx
000000000016ceca	je	0x16ceec
000000000016cecc	testq	%rax, %rax
000000000016cecf	jne	0x16cf12
000000000016ced1	jmp	0x16cfb4
000000000016ced6	movq	0x48(%rbx), %rax
000000000016ceda	movzbl	0x58(%rbx), %ecx
000000000016cede	testb	$0x1, %cl
000000000016cee1	jne	0x16cec1
000000000016cee3	shrl	%ecx
000000000016cee5	movb	$0x1, %dl
000000000016cee7	testq	%rcx, %rcx
000000000016ceea	jne	0x16cecc
000000000016ceec	movzbl	0xa0(%rbx), %ecx
000000000016cef3	testb	$0x1, %cl
000000000016cef6	jne	0x16cefc
000000000016cef8	shrl	%ecx
000000000016cefa	jmp	0x16cf03
000000000016cefc	movq	0xa8(%rbx), %rcx
000000000016cf03	testq	%rcx, %rcx
000000000016cf06	setne	%dl
000000000016cf09	testq	%rax, %rax
000000000016cf0c	je	0x16cfb4
000000000016cf12	testb	%dl, %dl
000000000016cf14	je	0x16cfb4
000000000016cf1a	movq	(%rsi), %rcx
000000000016cf1d	andq	$-0x2, %rcx
000000000016cf21	addq	$0x7ff, %rcx                    ## imm = 0x7FF
000000000016cf28	testb	$0x1, (%rsi)
000000000016cf2b	movl	$0x816, %eax                    ## imm = 0x816
000000000016cf30	cmovneq	%rcx, %rax
000000000016cf34	movq	%rsi, %rdi
000000000016cf37	movq	%rsi, %r14
000000000016cf3a	movq	%rax, %rsi
000000000016cf3d	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
000000000016cf42	xorps	%xmm0, %xmm0
000000000016cf45	movaps	%xmm0, -0x30(%rbp)
000000000016cf49	movaps	%xmm0, -0x40(%rbp)
000000000016cf4d	movl	$0x3f800000, -0x20(%rbp)        ## imm = 0x3F800000
000000000016cf54	leaq	-0x40(%rbp), %rdx
000000000016cf58	movq	%rbx, %rdi
000000000016cf5b	movq	%r14, %rsi
000000000016cf5e	callq	__ZNK19HGProgramDescriptor26privateEncodeShaderProgramERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERNS0_13unordered_mapIS6_bNS0_4hashIS6_EENS0_8equal_toIS6_EENS4_INS0_4pairIKS6_bEEEEEE ## HGProgramDescriptor::privateEncodeShaderProgram(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&, std::__1::unordered_map<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, bool, std::__1::hash<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::equal_to<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::allocator<std::__1::pair<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const, bool>>>&) const
000000000016cf63	movq	-0x30(%rbp), %rbx
000000000016cf67	testq	%rbx, %rbx
000000000016cf6a	jne	0x16cfa0
000000000016cf6c	movq	-0x40(%rbp), %rdi
000000000016cf70	movq	$0x0, -0x40(%rbp)
000000000016cf78	testq	%rdi, %rdi
000000000016cf7b	je	0x16cf82
000000000016cf7d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016cf82	addq	$0x30, %rsp
000000000016cf86	popq	%rbx
000000000016cf87	popq	%r14
000000000016cf89	popq	%rbp
000000000016cf8a	retq
000000000016cf8b	nopl	(%rax,%rax)
000000000016cf90	movq	%rbx, %rdi
000000000016cf93	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016cf98	movq	%r14, %rbx
000000000016cf9b	testq	%r14, %r14
000000000016cf9e	je	0x16cf6c
000000000016cfa0	movq	(%rbx), %r14
000000000016cfa3	testb	$0x1, 0x10(%rbx)
000000000016cfa7	je	0x16cf90
000000000016cfa9	movq	0x20(%rbx), %rdi
000000000016cfad	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016cfb2	jmp	0x16cf90
000000000016cfb4	movzbl	0x88(%rbx), %eax
000000000016cfbb	testb	$0x1, %al
000000000016cfbd	jne	0x16cfdc
000000000016cfbf	movl	%eax, %ecx
000000000016cfc1	shrl	%ecx
000000000016cfc3	testq	%rcx, %rcx
000000000016cfc6	je	0x16cfe8
000000000016cfc8	testb	$0x1, %al
000000000016cfca	je	0x16cff4
000000000016cfcc	movq	0x90(%rbx), %rdx
000000000016cfd3	movq	0x98(%rbx), %rbx
000000000016cfda	jmp	0x16d000
000000000016cfdc	movq	0x90(%rbx), %rcx
000000000016cfe3	testq	%rcx, %rcx
000000000016cfe6	jne	0x16cfc8
000000000016cfe8	testb	$0x1, 0x28(%rbx)
000000000016cfec	jne	0x16d013
000000000016cfee	addq	$0x29, %rbx
000000000016cff2	jmp	0x16d017
000000000016cff4	addq	$0x89, %rbx
000000000016cffb	shrb	%al
000000000016cffd	movzbl	%al, %edx
000000000016d000	movq	%rsi, %rdi
000000000016d003	movq	%rbx, %rsi
000000000016d006	addq	$0x30, %rsp
000000000016d00a	popq	%rbx
000000000016d00b	popq	%r14
000000000016d00d	popq	%rbp
000000000016d00e	jmp	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016d013	movq	0x38(%rbx), %rbx
000000000016d017	leaq	0x77e22f(%rip), %rdi            ## literal pool for: "Missing fragment shader for %s\n"
000000000016d01e	movq	%rbx, %rsi
000000000016d021	xorl	%eax, %eax
000000000016d023	addq	$0x30, %rsp
000000000016d027	popq	%rbx
000000000016d028	popq	%r14
000000000016d02a	popq	%rbp
000000000016d02b	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
000000000016d030	movq	%rax, %rbx
000000000016d033	leaq	-0x40(%rbp), %rdi
000000000016d037	callq	__ZNSt3__113unordered_mapIN20HGMetalFunctionCache4InfoE17HGMTLFunctionTypeNS1_8InfoHashENS_8equal_toIS2_EENS_9allocatorINS_4pairIKS2_S3_EEEEED1B9nqe210106Ev ## std::__1::unordered_map<HGMetalFunctionCache::Info, HGMTLFunctionType, HGMetalFunctionCache::InfoHash, std::__1::equal_to<HGMetalFunctionCache::Info>, std::__1::allocator<std::__1::pair<HGMetalFunctionCache::Info const, HGMTLFunctionType>>>::~unordered_map[abi:nqe210106]()
000000000016d03c	movq	%rbx, %rdi
000000000016d03f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016d044	nopw	%cs:(%rax,%rax)
