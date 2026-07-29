__ZNK19HGProgramDescriptor16CopyDependenciesEv:
000000000016d320	pushq	%rbp
000000000016d321	movq	%rsp, %rbp
000000000016d324	pushq	%r15
000000000016d326	pushq	%r14
000000000016d328	pushq	%rbx
000000000016d329	subq	$0x28, %rsp
000000000016d32d	movq	%rdi, %r14
000000000016d330	xorps	%xmm0, %xmm0
000000000016d333	movaps	%xmm0, -0x30(%rbp)
000000000016d337	movaps	%xmm0, -0x40(%rbp)
000000000016d33b	movl	$0x3f800000, -0x20(%rbp)        ## imm = 0x3F800000
000000000016d342	movl	$0x18, %edi
000000000016d347	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016d34c	movq	%rax, %rbx
000000000016d34f	xorps	%xmm0, %xmm0
000000000016d352	movups	%xmm0, (%rax)
000000000016d355	movq	$0x0, 0x10(%rax)
000000000016d35d	leaq	-0x40(%rbp), %rdx
000000000016d361	movq	%r14, %rdi
000000000016d364	movq	%rax, %rsi
000000000016d367	callq	__ZNK19HGProgramDescriptor22privateGetDependenciesEPNSt3__16vectorINS_10DependencyENS0_9allocatorIS2_EEEERNS0_13unordered_mapINS0_12basic_stringIcNS0_11char_traitsIcEENS3_IcEEEEbNS0_4hashISC_EENS0_8equal_toISC_EENS3_INS0_4pairIKSC_bEEEEEE ## HGProgramDescriptor::privateGetDependencies(std::__1::vector<HGProgramDescriptor::Dependency, std::__1::allocator<HGProgramDescriptor::Dependency>>*, std::__1::unordered_map<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, bool, std::__1::hash<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::equal_to<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::allocator<std::__1::pair<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const, bool>>>&) const
000000000016d36c	movq	-0x30(%rbp), %r14
000000000016d370	testq	%r14, %r14
000000000016d373	jne	0x16d3b0
000000000016d375	movq	-0x40(%rbp), %rdi
000000000016d379	movq	$0x0, -0x40(%rbp)
000000000016d381	testq	%rdi, %rdi
000000000016d384	je	0x16d38b
000000000016d386	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016d38b	movq	%rbx, %rax
000000000016d38e	addq	$0x28, %rsp
000000000016d392	popq	%rbx
000000000016d393	popq	%r14
000000000016d395	popq	%r15
000000000016d397	popq	%rbp
000000000016d398	retq
000000000016d399	nopl	(%rax)
000000000016d3a0	movq	%r14, %rdi
000000000016d3a3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016d3a8	movq	%r15, %r14
000000000016d3ab	testq	%r15, %r15
000000000016d3ae	je	0x16d375
000000000016d3b0	movq	(%r14), %r15
000000000016d3b3	testb	$0x1, 0x10(%r14)
000000000016d3b8	je	0x16d3a0
000000000016d3ba	movq	0x20(%r14), %rdi
000000000016d3be	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016d3c3	jmp	0x16d3a0
000000000016d3c5	movq	%rax, %rbx
000000000016d3c8	leaq	-0x40(%rbp), %rdi
000000000016d3cc	callq	__ZNSt3__113unordered_mapIN20HGMetalFunctionCache4InfoE17HGMTLFunctionTypeNS1_8InfoHashENS_8equal_toIS2_EENS_9allocatorINS_4pairIKS2_S3_EEEEED1B9nqe210106Ev ## std::__1::unordered_map<HGMetalFunctionCache::Info, HGMTLFunctionType, HGMetalFunctionCache::InfoHash, std::__1::equal_to<HGMetalFunctionCache::Info>, std::__1::allocator<std::__1::pair<HGMetalFunctionCache::Info const, HGMTLFunctionType>>>::~unordered_map[abi:nqe210106]()
000000000016d3d1	movq	%rbx, %rdi
000000000016d3d4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016d3d9	nopl	(%rax)
