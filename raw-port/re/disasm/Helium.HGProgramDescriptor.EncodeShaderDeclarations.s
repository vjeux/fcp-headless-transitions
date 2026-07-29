__ZNK19HGProgramDescriptor24EncodeShaderDeclarationsERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
0000000000168260	pushq	%rbp
0000000000168261	movq	%rsp, %rbp
0000000000168264	pushq	%r14
0000000000168266	pushq	%rbx
0000000000168267	subq	$0x40, %rsp
000000000016826b	movq	%rsi, %rbx
000000000016826e	movzbl	0x40(%rdi), %eax
0000000000168272	testb	$0x1, %al
0000000000168274	jne	0x168296
0000000000168276	shrl	%eax
0000000000168278	movzbl	0x58(%rdi), %ecx
000000000016827c	testb	$0x1, %cl
000000000016827f	je	0x1682a3
0000000000168281	movq	0x60(%rdi), %rcx
0000000000168285	movb	$0x1, %dl
0000000000168287	testq	%rcx, %rcx
000000000016828a	je	0x1682ac
000000000016828c	testq	%rax, %rax
000000000016828f	jne	0x1682d2
0000000000168291	jmp	0x1683f9
0000000000168296	movq	0x48(%rdi), %rax
000000000016829a	movzbl	0x58(%rdi), %ecx
000000000016829e	testb	$0x1, %cl
00000000001682a1	jne	0x168281
00000000001682a3	shrl	%ecx
00000000001682a5	movb	$0x1, %dl
00000000001682a7	testq	%rcx, %rcx
00000000001682aa	jne	0x16828c
00000000001682ac	movzbl	0xa0(%rdi), %ecx
00000000001682b3	testb	$0x1, %cl
00000000001682b6	jne	0x1682bc
00000000001682b8	shrl	%ecx
00000000001682ba	jmp	0x1682c3
00000000001682bc	movq	0xa8(%rdi), %rcx
00000000001682c3	testq	%rcx, %rcx
00000000001682c6	setne	%dl
00000000001682c9	testq	%rax, %rax
00000000001682cc	je	0x1683f9
00000000001682d2	testb	%dl, %dl
00000000001682d4	je	0x1683f9
00000000001682da	movq	%rdi, %r14
00000000001682dd	movq	(%rbx), %rax
00000000001682e0	andq	$-0x2, %rax
00000000001682e4	addq	$0x3ff, %rax                    ## imm = 0x3FF
00000000001682ea	testb	$0x1, (%rbx)
00000000001682ed	movl	$0x416, %esi                    ## imm = 0x416
00000000001682f2	cmovneq	%rax, %rsi
00000000001682f6	movq	%rbx, %rdi
00000000001682f9	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
00000000001682fe	leaq	-0x30(%rbp), %rdi
0000000000168302	callq	__ZN12HGMetalUtils20stringForMetalHeaderEv ## HGMetalUtils::stringForMetalHeader()
0000000000168307	movzbl	-0x30(%rbp), %edx
000000000016830b	testb	$0x1, %dl
000000000016830e	je	0x16831a
0000000000168310	movq	-0x20(%rbp), %rsi
0000000000168314	movq	-0x28(%rbp), %rdx
0000000000168318	jmp	0x168320
000000000016831a	shrl	%edx
000000000016831c	leaq	-0x2f(%rbp), %rsi
0000000000168320	movq	%rbx, %rdi
0000000000168323	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000168328	testb	$0x1, -0x30(%rbp)
000000000016832c	je	0x168337
000000000016832e	movq	-0x20(%rbp), %rdi
0000000000168332	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000168337	leaq	0x78e9d6(%rip), %rsi            ## literal pool for: "struct FragmentOut {\n"
000000000016833e	movq	%rbx, %rdi
0000000000168341	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000168346	movb	$0x8, -0x48(%rbp)
000000000016834a	movl	$0x20202020, -0x47(%rbp)        ## imm = 0x20202020
0000000000168351	movb	$0x0, -0x43(%rbp)
0000000000168355	leaq	0x782ccc(%rip), %rsi            ## literal pool for: "float4 color0 [[ color(0) ]];\n"
000000000016835c	leaq	-0x48(%rbp), %rdi
0000000000168360	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000168365	movq	0x10(%rax), %rcx
0000000000168369	movq	%rcx, -0x20(%rbp)
000000000016836d	movups	(%rax), %xmm0
0000000000168370	movaps	%xmm0, -0x30(%rbp)
0000000000168374	xorps	%xmm0, %xmm0
0000000000168377	movups	%xmm0, (%rax)
000000000016837a	movq	$0x0, 0x10(%rax)
0000000000168382	movzbl	-0x30(%rbp), %edx
0000000000168386	testb	$0x1, %dl
0000000000168389	je	0x168395
000000000016838b	movq	-0x20(%rbp), %rsi
000000000016838f	movq	-0x28(%rbp), %rdx
0000000000168393	jmp	0x16839b
0000000000168395	shrl	%edx
0000000000168397	leaq	-0x2f(%rbp), %rsi
000000000016839b	movq	%rbx, %rdi
000000000016839e	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001683a3	testb	$0x1, -0x30(%rbp)
00000000001683a7	je	0x1683b2
00000000001683a9	movq	-0x20(%rbp), %rdi
00000000001683ad	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001683b2	testb	$0x1, -0x48(%rbp)
00000000001683b6	je	0x1683c1
00000000001683b8	movq	-0x38(%rbp), %rdi
00000000001683bc	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001683c1	leaq	0x78e6f6(%rip), %rsi            ## literal pool for: "};\n\n"
00000000001683c8	movq	%rbx, %rdi
00000000001683cb	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001683d0	leaq	0x782c70(%rip), %rsi            ## literal pool for: "extern \"C\" {\n"
00000000001683d7	movq	%rbx, %rdi
00000000001683da	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001683df	movq	%r14, %rdi
00000000001683e2	movq	%rbx, %rsi
00000000001683e5	callq	__ZNK19HGProgramDescriptor31privateEncodeShaderDeclarationsERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE ## HGProgramDescriptor::privateEncodeShaderDeclarations(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&) const
00000000001683ea	leaq	0x752875(%rip), %rsi            ## literal pool for: "}\n"
00000000001683f1	movq	%rbx, %rdi
00000000001683f4	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001683f9	addq	$0x40, %rsp
00000000001683fd	popq	%rbx
00000000001683fe	popq	%r14
0000000000168400	popq	%rbp
0000000000168401	retq
0000000000168402	movq	%rax, %rbx
0000000000168405	testb	$0x1, -0x30(%rbp)
0000000000168409	je	0x168419
000000000016840b	movq	-0x20(%rbp), %rdi
000000000016840f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000168414	jmp	0x168419
0000000000168416	movq	%rax, %rbx
0000000000168419	testb	$0x1, -0x48(%rbp)
000000000016841d	je	0x168437
000000000016841f	movq	-0x38(%rbp), %rdi
0000000000168423	jmp	0x168432
0000000000168425	movq	%rax, %rbx
0000000000168428	testb	$0x1, -0x30(%rbp)
000000000016842c	je	0x168437
000000000016842e	movq	-0x20(%rbp), %rdi
0000000000168432	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000168437	movq	%rbx, %rdi
000000000016843a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016843f	nop
