__ZNK19HGProgramDescriptor7GetHashEv:
000000000016d910	pushq	%rbp
000000000016d911	movq	%rsp, %rbp
000000000016d914	pushq	%r15
000000000016d916	pushq	%r14
000000000016d918	pushq	%r13
000000000016d91a	pushq	%r12
000000000016d91c	pushq	%rbx
000000000016d91d	subq	$0x78, %rsp
000000000016d921	movq	%rdi, %r12
000000000016d924	movzbl	0x40(%rdi), %eax
000000000016d928	testb	$0x1, %al
000000000016d92a	jne	0x16d953
000000000016d92c	movzbl	%al, %ecx
000000000016d92f	shrl	%ecx
000000000016d931	movzbl	0x58(%r12), %edx
000000000016d937	testb	$0x1, %dl
000000000016d93a	je	0x16d963
000000000016d93c	movq	0x60(%r12), %rdx
000000000016d941	movb	$0x1, %sil
000000000016d944	testq	%rdx, %rdx
000000000016d947	je	0x16d96d
000000000016d949	testq	%rcx, %rcx
000000000016d94c	jne	0x16d997
000000000016d94e	jmp	0x16e034
000000000016d953	movq	0x48(%r12), %rcx
000000000016d958	movzbl	0x58(%r12), %edx
000000000016d95e	testb	$0x1, %dl
000000000016d961	jne	0x16d93c
000000000016d963	shrl	%edx
000000000016d965	movb	$0x1, %sil
000000000016d968	testq	%rdx, %rdx
000000000016d96b	jne	0x16d949
000000000016d96d	movzbl	0xa0(%r12), %edx
000000000016d976	testb	$0x1, %dl
000000000016d979	jne	0x16d97f
000000000016d97b	shrl	%edx
000000000016d97d	jmp	0x16d987
000000000016d97f	movq	0xa8(%r12), %rdx
000000000016d987	testq	%rdx, %rdx
000000000016d98a	setne	%sil
000000000016d98e	testq	%rcx, %rcx
000000000016d991	je	0x16e034
000000000016d997	testb	%sil, %sil
000000000016d99a	je	0x16e034
000000000016d9a0	movq	0x78(%r12), %rcx
000000000016d9a5	subq	0x70(%r12), %rcx
000000000016d9aa	movq	%r12, -0x68(%rbp)
000000000016d9ae	je	0x16e0ba
000000000016d9b4	sarq	$0x4, %rcx
000000000016d9b8	movl	$0x8, %edx
000000000016d9bd	movq	$0x0, -0x78(%rbp)
000000000016d9c5	leaq	-0x90(%rbp), %rsi
000000000016d9cc	xorl	%r15d, %r15d
000000000016d9cf	xorl	%ebx, %ebx
000000000016d9d1	movq	$0x0, -0x40(%rbp)
000000000016d9d9	movq	%rcx, -0x98(%rbp)
000000000016d9e0	jmp	0x16da27
000000000016d9e2	movq	%rbx, %r13
000000000016d9e5	movq	%r13, %rbx
000000000016d9e8	movq	-0x70(%rbp), %rdi
000000000016d9ec	testq	%rdi, %rdi
000000000016d9ef	je	0x16d9fa
000000000016d9f1	movq	(%rdi), %rax
000000000016d9f4	callq	*0x18(%rax)
000000000016d9f7	movq	%r13, %rbx
000000000016d9fa	movq	-0x78(%rbp), %rsi
000000000016d9fe	incq	%rsi
000000000016da01	movq	-0xa0(%rbp), %rdx
000000000016da08	addq	$0x10, %rdx
000000000016da0c	movq	-0x98(%rbp), %rcx
000000000016da13	movq	%rsi, -0x78(%rbp)
000000000016da17	cmpq	%rsi, %rcx
000000000016da1a	leaq	-0x90(%rbp), %rsi
000000000016da21	je	0x16e067
000000000016da27	movq	0x70(%r12), %rax
000000000016da2c	movl	-0x8(%rax,%rdx), %r14d
000000000016da31	movq	%rdx, -0xa0(%rbp)
000000000016da38	movq	(%rax,%rdx), %r13
000000000016da3c	testq	%r13, %r13
000000000016da3f	je	0x16da52
000000000016da41	movq	(%r13), %rax
000000000016da45	movq	%r13, %rdi
000000000016da48	callq	*0x10(%rax)
000000000016da4b	leaq	-0x90(%rbp), %rsi
000000000016da52	movq	%r13, -0x70(%rbp)
000000000016da56	cmpl	$0x3, %r14d
000000000016da5a	ja	0x16d9e2
000000000016da5c	movl	%r14d, %eax
000000000016da5f	leaq	0xbae(%rip), %rcx
000000000016da66	movslq	(%rcx,%rax,4), %rax
000000000016da6a	addq	%rcx, %rax
000000000016da6d	jmpq	*%rax
000000000016da6f	movq	-0x70(%rbp), %rdi
000000000016da73	testq	%rdi, %rdi
000000000016da76	je	0x16d9fa
000000000016da78	movq	(%rdi), %rax
000000000016da7b	callq	*0x10(%rax)
000000000016da7e	leaq	-0x90(%rbp), %r14
000000000016da85	movq	%r14, %rdi
000000000016da88	movq	-0x78(%rbp), %rsi
000000000016da8c	callq	0x3c4f7c                        ## symbol stub for: __ZNSt3__19to_stringEm
000000000016da91	movq	%r14, %rdi
000000000016da94	xorl	%esi, %esi
000000000016da96	leaq	0x77d7d0(%rip), %rdx            ## literal pool for: "Pointer"
000000000016da9d	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
000000000016daa2	movq	0x10(%rax), %rcx
000000000016daa6	movq	%rcx, -0x50(%rbp)
000000000016daaa	movups	(%rax), %xmm0
000000000016daad	movaps	%xmm0, -0x60(%rbp)
000000000016dab1	xorps	%xmm0, %xmm0
000000000016dab4	movups	%xmm0, (%rax)
000000000016dab7	movq	$0x0, 0x10(%rax)
000000000016dabf	movzbl	-0x60(%rbp), %edx
000000000016dac3	testb	$0x1, %dl
000000000016dac6	je	0x16de47
000000000016dacc	movq	-0x50(%rbp), %rsi
000000000016dad0	movq	-0x58(%rbp), %rdx
000000000016dad4	jmp	0x16de4d
000000000016dad9	movq	%rsi, %r14
000000000016dadc	movq	%rsi, %rdi
000000000016dadf	movq	-0x78(%rbp), %rsi
000000000016dae3	callq	0x3c4f7c                        ## symbol stub for: __ZNSt3__19to_stringEm
000000000016dae8	movq	%r14, %rdi
000000000016daeb	xorl	%esi, %esi
000000000016daed	leaq	0x77d789(%rip), %rdx            ## literal pool for: "Ignore"
000000000016daf4	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
000000000016daf9	movq	0x10(%rax), %rcx
000000000016dafd	movq	%rcx, -0x50(%rbp)
000000000016db01	movups	(%rax), %xmm0
000000000016db04	movaps	%xmm0, -0x60(%rbp)
000000000016db08	xorps	%xmm0, %xmm0
000000000016db0b	movups	%xmm0, (%rax)
000000000016db0e	movq	$0x0, 0x10(%rax)
000000000016db16	movzbl	-0x60(%rbp), %edx
000000000016db1a	testb	$0x1, %dl
000000000016db1d	je	0x16dbde
000000000016db23	movq	-0x50(%rbp), %rsi
000000000016db27	movq	-0x58(%rbp), %rdx
000000000016db2b	jmp	0x16dbe4
000000000016db30	movq	%rsi, %r14
000000000016db33	movq	%rsi, %rdi
000000000016db36	movq	-0x78(%rbp), %rsi
000000000016db3a	callq	0x3c4f7c                        ## symbol stub for: __ZNSt3__19to_stringEm
000000000016db3f	movq	%r14, %rdi
000000000016db42	xorl	%esi, %esi
000000000016db44	leaq	0x77d739(%rip), %rdx            ## literal pool for: "Zero"
000000000016db4b	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
000000000016db50	movq	0x10(%rax), %rcx
000000000016db54	movq	%rcx, -0x50(%rbp)
000000000016db58	movups	(%rax), %xmm0
000000000016db5b	movaps	%xmm0, -0x60(%rbp)
000000000016db5f	xorps	%xmm0, %xmm0
000000000016db62	movups	%xmm0, (%rax)
000000000016db65	movq	$0x0, 0x10(%rax)
000000000016db6d	movzbl	-0x60(%rbp), %edx
000000000016db71	testb	$0x1, %dl
000000000016db74	je	0x16dc6c
000000000016db7a	movq	-0x50(%rbp), %rsi
000000000016db7e	movq	-0x58(%rbp), %rdx
000000000016db82	jmp	0x16dc72
000000000016db87	movq	%rsi, %r14
000000000016db8a	movq	%rsi, %rdi
000000000016db8d	movq	-0x78(%rbp), %rsi
000000000016db91	callq	0x3c4f7c                        ## symbol stub for: __ZNSt3__19to_stringEm
000000000016db96	movq	%r14, %rdi
000000000016db99	xorl	%esi, %esi
000000000016db9b	leaq	0x77d6d3(%rip), %rdx            ## literal pool for: "Sampler"
000000000016dba2	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
000000000016dba7	movq	0x10(%rax), %rcx
000000000016dbab	movq	%rcx, -0x50(%rbp)
000000000016dbaf	movups	(%rax), %xmm0
000000000016dbb2	movaps	%xmm0, -0x60(%rbp)
000000000016dbb6	xorps	%xmm0, %xmm0
000000000016dbb9	movups	%xmm0, (%rax)
000000000016dbbc	movq	$0x0, 0x10(%rax)
000000000016dbc4	movzbl	-0x60(%rbp), %edx
000000000016dbc8	testb	$0x1, %dl
000000000016dbcb	je	0x16dd3b
000000000016dbd1	movq	-0x50(%rbp), %rsi
000000000016dbd5	movq	-0x58(%rbp), %rdx
000000000016dbd9	jmp	0x16dd41
000000000016dbde	shrl	%edx
000000000016dbe0	leaq	-0x5f(%rbp), %rsi
000000000016dbe4	leaq	-0x31(%rbp), %rdi
000000000016dbe8	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016dbed	movq	%rax, %r13
000000000016dbf0	cmpq	-0x40(%rbp), %rbx
000000000016dbf4	jb	0x16dd53
000000000016dbfa	subq	%r15, %rbx
000000000016dbfd	movq	%rbx, %r12
000000000016dc00	sarq	$0x3, %r12
000000000016dc04	leaq	0x1(%r12), %rax
000000000016dc09	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dc13	cmpq	%rcx, %rax
000000000016dc16	movq	%r15, -0x30(%rbp)
000000000016dc1a	ja	0x16e444
000000000016dc20	movq	-0x40(%rbp), %rcx
000000000016dc24	subq	%r15, %rcx
000000000016dc27	movq	%rcx, %r15
000000000016dc2a	sarq	$0x2, %r15
000000000016dc2e	cmpq	%rax, %r15
000000000016dc31	cmovbeq	%rax, %r15
000000000016dc35	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016dc3f	cmpq	%rax, %rcx
000000000016dc42	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dc4c	jb	0x16dc51
000000000016dc4e	movq	%rax, %r15
000000000016dc51	cmpq	%rax, %r15
000000000016dc54	ja	0x16e43d
000000000016dc5a	leaq	(,%r15,8), %rdi
000000000016dc62	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016dc67	jmp	0x16dcf5
000000000016dc6c	shrl	%edx
000000000016dc6e	leaq	-0x5f(%rbp), %rsi
000000000016dc72	leaq	-0x31(%rbp), %rdi
000000000016dc76	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016dc7b	movq	%rax, %r13
000000000016dc7e	cmpq	-0x40(%rbp), %rbx
000000000016dc82	jb	0x16dd53
000000000016dc88	subq	%r15, %rbx
000000000016dc8b	movq	%rbx, %r12
000000000016dc8e	sarq	$0x3, %r12
000000000016dc92	leaq	0x1(%r12), %rax
000000000016dc97	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dca1	cmpq	%rcx, %rax
000000000016dca4	movq	%r15, -0x30(%rbp)
000000000016dca8	ja	0x16e436
000000000016dcae	movq	-0x40(%rbp), %rcx
000000000016dcb2	subq	%r15, %rcx
000000000016dcb5	movq	%rcx, %r15
000000000016dcb8	sarq	$0x2, %r15
000000000016dcbc	cmpq	%rax, %r15
000000000016dcbf	cmovbeq	%rax, %r15
000000000016dcc3	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016dccd	cmpq	%rax, %rcx
000000000016dcd0	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dcda	jb	0x16dcdf
000000000016dcdc	movq	%rax, %r15
000000000016dcdf	cmpq	%rax, %r15
000000000016dce2	ja	0x16e42f
000000000016dce8	leaq	(,%r15,8), %rdi
000000000016dcf0	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016dcf5	leaq	(%rax,%rbx), %r14
000000000016dcf9	leaq	(%rax,%r15,8), %rcx
000000000016dcfd	movq	%rcx, -0x40(%rbp)
000000000016dd01	movq	%r13, (%rax,%rbx)
000000000016dd05	leaq	(%rax,%rbx), %r13
000000000016dd09	addq	$0x8, %r13
000000000016dd0d	shlq	$0x3, %r12
000000000016dd11	subq	%r12, %r14
000000000016dd14	movq	%r14, %rdi
000000000016dd17	movq	-0x30(%rbp), %r15
000000000016dd1b	movq	%r15, %rsi
000000000016dd1e	movq	%rbx, %rdx
000000000016dd21	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016dd26	testq	%r15, %r15
000000000016dd29	je	0x16dd33
000000000016dd2b	movq	%r15, %rdi
000000000016dd2e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016dd33	movq	%r14, %r15
000000000016dd36	jmp	0x16de34
000000000016dd3b	shrl	%edx
000000000016dd3d	leaq	-0x5f(%rbp), %rsi
000000000016dd41	leaq	-0x31(%rbp), %rdi
000000000016dd45	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016dd4a	movq	%rax, %r13
000000000016dd4d	cmpq	-0x40(%rbp), %rbx
000000000016dd51	jae	0x16dd87
000000000016dd53	movq	%r13, (%rbx)
000000000016dd56	addq	$0x8, %rbx
000000000016dd5a	movq	%rbx, %r13
000000000016dd5d	testb	$0x1, -0x60(%rbp)
000000000016dd61	je	0x16dd6c
000000000016dd63	movq	-0x50(%rbp), %rdi
000000000016dd67	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016dd6c	testb	$0x1, -0x90(%rbp)
000000000016dd73	je	0x16d9e5
000000000016dd79	movq	-0x80(%rbp), %rdi
000000000016dd7d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016dd82	jmp	0x16d9e5
000000000016dd87	subq	%r15, %rbx
000000000016dd8a	movq	%rbx, %r14
000000000016dd8d	sarq	$0x3, %r14
000000000016dd91	leaq	0x1(%r14), %rax
000000000016dd95	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dd9f	cmpq	%rcx, %rax
000000000016dda2	movq	%r15, -0x30(%rbp)
000000000016dda6	ja	0x16e428
000000000016ddac	movq	-0x40(%rbp), %rcx
000000000016ddb0	subq	%r15, %rcx
000000000016ddb3	movq	%rcx, %r15
000000000016ddb6	sarq	$0x2, %r15
000000000016ddba	cmpq	%rax, %r15
000000000016ddbd	cmovbeq	%rax, %r15
000000000016ddc1	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016ddcb	cmpq	%rax, %rcx
000000000016ddce	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016ddd8	jb	0x16dddd
000000000016ddda	movq	%rax, %r15
000000000016dddd	cmpq	%rax, %r15
000000000016dde0	ja	0x16e421
000000000016dde6	leaq	(,%r15,8), %rdi
000000000016ddee	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016ddf3	leaq	(%rax,%rbx), %r12
000000000016ddf7	leaq	(%rax,%r15,8), %rcx
000000000016ddfb	movq	%rcx, -0x40(%rbp)
000000000016ddff	movq	%r13, (%rax,%rbx)
000000000016de03	leaq	(%rax,%rbx), %r13
000000000016de07	addq	$0x8, %r13
000000000016de0b	shlq	$0x3, %r14
000000000016de0f	subq	%r14, %r12
000000000016de12	movq	%r12, %rdi
000000000016de15	movq	-0x30(%rbp), %r14
000000000016de19	movq	%r14, %rsi
000000000016de1c	movq	%rbx, %rdx
000000000016de1f	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016de24	testq	%r14, %r14
000000000016de27	je	0x16de31
000000000016de29	movq	%r14, %rdi
000000000016de2c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016de31	movq	%r12, %r15
000000000016de34	movq	-0x68(%rbp), %r12
000000000016de38	testb	$0x1, -0x60(%rbp)
000000000016de3c	jne	0x16dd63
000000000016de42	jmp	0x16dd6c
000000000016de47	shrl	%edx
000000000016de49	leaq	-0x5f(%rbp), %rsi
000000000016de4d	leaq	-0x31(%rbp), %rdi
000000000016de51	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016de56	movq	%rax, %r14
000000000016de59	cmpq	-0x40(%rbp), %rbx
000000000016de5d	jae	0x16debc
000000000016de5f	movq	%r14, (%rbx)
000000000016de62	addq	$0x8, %rbx
000000000016de66	movq	%rbx, %r14
000000000016de69	movq	-0x70(%rbp), %rbx
000000000016de6d	testb	$0x1, -0x60(%rbp)
000000000016de71	je	0x16de7c
000000000016de73	movq	-0x50(%rbp), %rdi
000000000016de77	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016de7c	movq	%r15, %r12
000000000016de7f	testb	$0x1, -0x90(%rbp)
000000000016de86	je	0x16de91
000000000016de88	movq	-0x80(%rbp), %rdi
000000000016de8c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016de91	movq	%rbx, %rdi
000000000016de94	callq	__ZNK19HGProgramDescriptor7GetHashEv ## HGProgramDescriptor::GetHash() const
000000000016de99	movq	%rax, %r13
000000000016de9c	cmpq	-0x40(%rbp), %r14
000000000016dea0	jae	0x16df77
000000000016dea6	movq	%r13, (%r14)
000000000016dea9	addq	$0x8, %r14
000000000016dead	movq	%r14, %r13
000000000016deb0	movq	-0x70(%rbp), %rbx
000000000016deb4	movq	%r12, %r15
000000000016deb7	jmp	0x16e01f
000000000016debc	subq	%r15, %rbx
000000000016debf	movq	%rbx, %r13
000000000016dec2	sarq	$0x3, %r13
000000000016dec6	leaq	0x1(%r13), %rax
000000000016deca	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016ded4	cmpq	%rcx, %rax
000000000016ded7	ja	0x16e456
000000000016dedd	movq	-0x40(%rbp), %rcx
000000000016dee1	subq	%r15, %rcx
000000000016dee4	movq	%rcx, %r12
000000000016dee7	sarq	$0x2, %r12
000000000016deeb	cmpq	%rax, %r12
000000000016deee	cmovbeq	%rax, %r12
000000000016def2	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016defc	cmpq	%rax, %rcx
000000000016deff	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016df09	jb	0x16df0e
000000000016df0b	movq	%rax, %r12
000000000016df0e	cmpq	%rax, %r12
000000000016df11	ja	0x16e44b
000000000016df17	leaq	(,%r12,8), %rdi
000000000016df1f	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016df24	leaq	(%rax,%rbx), %rdx
000000000016df28	leaq	(%rax,%r12,8), %rcx
000000000016df2c	movq	%rdx, %r12
000000000016df2f	movq	%rcx, -0x40(%rbp)
000000000016df33	movq	%r14, (%rax,%rbx)
000000000016df37	leaq	(%rax,%rbx), %r14
000000000016df3b	addq	$0x8, %r14
000000000016df3f	shlq	$0x3, %r13
000000000016df43	subq	%r13, %r12
000000000016df46	movq	%r12, %rdi
000000000016df49	movq	%r15, %rsi
000000000016df4c	movq	%rbx, %rdx
000000000016df4f	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016df54	testq	%r15, %r15
000000000016df57	je	0x16df61
000000000016df59	movq	%r15, %rdi
000000000016df5c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016df61	movq	%r12, %r15
000000000016df64	movq	-0x70(%rbp), %rbx
000000000016df68	testb	$0x1, -0x60(%rbp)
000000000016df6c	jne	0x16de73
000000000016df72	jmp	0x16de7c
000000000016df77	movq	%r12, %rdx
000000000016df7a	subq	%r12, %r14
000000000016df7d	movq	%r14, %r15
000000000016df80	sarq	$0x3, %r14
000000000016df84	leaq	0x1(%r14), %rax
000000000016df88	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016df92	cmpq	%rcx, %rax
000000000016df95	ja	0x16e46c
000000000016df9b	movq	-0x40(%rbp), %rcx
000000000016df9f	subq	%rdx, %rcx
000000000016dfa2	movq	%rcx, %rbx
000000000016dfa5	sarq	$0x2, %rbx
000000000016dfa9	cmpq	%rax, %rbx
000000000016dfac	cmovbeq	%rax, %rbx
000000000016dfb0	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016dfba	cmpq	%rax, %rcx
000000000016dfbd	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016dfc7	jb	0x16dfcc
000000000016dfc9	movq	%rax, %rbx
000000000016dfcc	cmpq	%rax, %rbx
000000000016dfcf	ja	0x16e461
000000000016dfd5	leaq	(,%rbx,8), %rdi
000000000016dfdd	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016dfe2	movq	%r15, %rdx
000000000016dfe5	addq	%rax, %r15
000000000016dfe8	leaq	(%rax,%rbx,8), %rcx
000000000016dfec	movq	%rcx, -0x40(%rbp)
000000000016dff0	movq	%r13, (%rax,%rdx)
000000000016dff4	leaq	(%rax,%rdx), %r13
000000000016dff8	addq	$0x8, %r13
000000000016dffc	shlq	$0x3, %r14
000000000016e000	subq	%r14, %r15
000000000016e003	movq	%r15, %rdi
000000000016e006	movq	%r12, %rsi
000000000016e009	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016e00e	testq	%r12, %r12
000000000016e011	je	0x16e01b
000000000016e013	movq	%r12, %rdi
000000000016e016	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e01b	movq	-0x70(%rbp), %rbx
000000000016e01f	movq	-0x68(%rbp), %r12
000000000016e023	movq	(%rbx), %rax
000000000016e026	movq	%rbx, %rdi
000000000016e029	callq	*0x18(%rax)
000000000016e02c	movq	%rbx, %rdi
000000000016e02f	jmp	0x16d9f1
000000000016e034	movzbl	0x88(%r12), %eax
000000000016e03d	testb	$0x1, %al
000000000016e03f	jne	0x16e098
000000000016e041	movl	%eax, %ecx
000000000016e043	shrl	%ecx
000000000016e045	testq	%rcx, %rcx
000000000016e048	je	0x16e0a5
000000000016e04a	testb	$0x1, %al
000000000016e04c	je	0x16e0f9
000000000016e052	movq	0x90(%r12), %rdx
000000000016e05a	movq	0x98(%r12), %r12
000000000016e062	jmp	0x16e105
000000000016e067	movzbl	0x40(%r12), %eax
000000000016e06d	testb	$0x1, %al
000000000016e06f	jne	0x16e0cb
000000000016e071	movl	%eax, %ecx
000000000016e073	shrb	%cl
000000000016e075	movzbl	%cl, %ecx
000000000016e078	testq	%rcx, %rcx
000000000016e07b	movq	%r15, -0x30(%rbp)
000000000016e07f	je	0x16e0d9
000000000016e081	testb	$0x1, %al
000000000016e083	je	0x16e119
000000000016e089	movq	0x50(%r12), %rsi
000000000016e08e	movq	0x48(%r12), %rdx
000000000016e093	jmp	0x16e123
000000000016e098	movq	0x90(%r12), %rcx
000000000016e0a0	testq	%rcx, %rcx
000000000016e0a3	jne	0x16e04a
000000000016e0a5	testb	$0x1, 0x28(%r12)
000000000016e0ab	jne	0x16e19b
000000000016e0b1	addq	$0x29, %r12
000000000016e0b5	jmp	0x16e1a0
000000000016e0ba	movq	$0x0, -0x40(%rbp)
000000000016e0c2	xorl	%ebx, %ebx
000000000016e0c4	xorl	%r15d, %r15d
000000000016e0c7	testb	$0x1, %al
000000000016e0c9	je	0x16e071
000000000016e0cb	movq	0x48(%r12), %rcx
000000000016e0d0	testq	%rcx, %rcx
000000000016e0d3	movq	%r15, -0x30(%rbp)
000000000016e0d7	jne	0x16e081
000000000016e0d9	movzbl	0x28(%r12), %eax
000000000016e0df	testb	$0x1, %al
000000000016e0e1	jne	0x16e1b9
000000000016e0e7	movl	%eax, %ecx
000000000016e0e9	shrl	%ecx
000000000016e0eb	testq	%rcx, %rcx
000000000016e0ee	jne	0x16e1c3
000000000016e0f4	jmp	0x16e1f6
000000000016e0f9	addq	$0x89, %r12
000000000016e100	shrb	%al
000000000016e102	movzbl	%al, %edx
000000000016e105	leaq	-0x60(%rbp), %rdi
000000000016e109	movq	%r12, %rsi
000000000016e10c	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016e111	movq	%rax, %r14
000000000016e114	jmp	0x16e35d
000000000016e119	leaq	0x41(%r12), %rsi
000000000016e11e	shrb	%al
000000000016e120	movzbl	%al, %edx
000000000016e123	leaq	-0x60(%rbp), %rdi
000000000016e127	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016e12c	movq	%rax, %r14
000000000016e12f	cmpq	-0x40(%rbp), %rbx
000000000016e133	jb	0x16e1ef
000000000016e139	subq	%r15, %rbx
000000000016e13c	movq	%rbx, %r13
000000000016e13f	sarq	$0x3, %r13
000000000016e143	leaq	0x1(%r13), %rax
000000000016e147	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016e151	cmpq	%rcx, %rax
000000000016e154	ja	0x16e477
000000000016e15a	movq	-0x40(%rbp), %rdx
000000000016e15e	subq	%r15, %rdx
000000000016e161	movq	%rdx, %r15
000000000016e164	sarq	$0x2, %r15
000000000016e168	cmpq	%rax, %r15
000000000016e16b	cmovbeq	%rax, %r15
000000000016e16f	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016e179	cmpq	%rax, %rdx
000000000016e17c	cmovaeq	%rcx, %r15
000000000016e180	cmpq	%rcx, %r15
000000000016e183	ja	0x16e47e
000000000016e189	leaq	(,%r15,8), %rdi
000000000016e191	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016e196	jmp	0x16e276
000000000016e19b	movq	0x38(%r12), %r12
000000000016e1a0	leaq	0x77d0a6(%rip), %rdi            ## literal pool for: "Missing fragment shader for %s\n"
000000000016e1a7	xorl	%r14d, %r14d
000000000016e1aa	movq	%r12, %rsi
000000000016e1ad	xorl	%eax, %eax
000000000016e1af	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
000000000016e1b4	jmp	0x16e35d
000000000016e1b9	movq	0x30(%r12), %rcx
000000000016e1be	testq	%rcx, %rcx
000000000016e1c1	je	0x16e1f6
000000000016e1c3	testb	$0x1, %al
000000000016e1c5	je	0x16e1d3
000000000016e1c7	movq	0x38(%r12), %rsi
000000000016e1cc	movq	0x30(%r12), %rdx
000000000016e1d1	jmp	0x16e1dd
000000000016e1d3	leaq	0x29(%r12), %rsi
000000000016e1d8	shrb	%al
000000000016e1da	movzbl	%al, %edx
000000000016e1dd	leaq	-0x60(%rbp), %rdi
000000000016e1e1	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016e1e6	movq	%rax, %r14
000000000016e1e9	cmpq	-0x40(%rbp), %rbx
000000000016e1ed	jae	0x16e219
000000000016e1ef	movq	%r14, (%rbx)
000000000016e1f2	addq	$0x8, %rbx
000000000016e1f6	movq	%rbx, %r15
000000000016e1f9	movzbl	0x58(%r12), %eax
000000000016e1ff	testb	$0x1, %al
000000000016e201	jne	0x16e2ca
000000000016e207	movl	%eax, %ecx
000000000016e209	shrl	%ecx
000000000016e20b	testq	%rcx, %rcx
000000000016e20e	jne	0x16e2d4
000000000016e214	jmp	0x16e309
000000000016e219	subq	%r15, %rbx
000000000016e21c	movq	%rbx, %r13
000000000016e21f	sarq	$0x3, %r13
000000000016e223	leaq	0x1(%r13), %rax
000000000016e227	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016e231	cmpq	%rcx, %rax
000000000016e234	ja	0x16e493
000000000016e23a	movq	-0x40(%rbp), %rdx
000000000016e23e	subq	%r15, %rdx
000000000016e241	movq	%rdx, %r15
000000000016e244	sarq	$0x2, %r15
000000000016e248	cmpq	%rax, %r15
000000000016e24b	cmovbeq	%rax, %r15
000000000016e24f	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016e259	cmpq	%rax, %rdx
000000000016e25c	cmovaeq	%rcx, %r15
000000000016e260	cmpq	%rcx, %r15
000000000016e263	ja	0x16e49a
000000000016e269	leaq	(,%r15,8), %rdi
000000000016e271	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016e276	leaq	(%rax,%rbx), %r12
000000000016e27a	leaq	(%rax,%r15,8), %rcx
000000000016e27e	movq	%rcx, -0x40(%rbp)
000000000016e282	movq	%r14, (%rax,%rbx)
000000000016e286	leaq	(%rax,%rbx), %r15
000000000016e28a	addq	$0x8, %r15
000000000016e28e	shlq	$0x3, %r13
000000000016e292	subq	%r13, %r12
000000000016e295	movq	%r12, %rdi
000000000016e298	movq	-0x30(%rbp), %r14
000000000016e29c	movq	%r14, %rsi
000000000016e29f	movq	%rbx, %rdx
000000000016e2a2	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016e2a7	testq	%r14, %r14
000000000016e2aa	je	0x16e2b4
000000000016e2ac	movq	%r14, %rdi
000000000016e2af	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e2b4	movq	%r12, -0x30(%rbp)
000000000016e2b8	movq	-0x68(%rbp), %r12
000000000016e2bc	movzbl	0x58(%r12), %eax
000000000016e2c2	testb	$0x1, %al
000000000016e2c4	je	0x16e207
000000000016e2ca	movq	0x60(%r12), %rcx
000000000016e2cf	testq	%rcx, %rcx
000000000016e2d2	je	0x16e309
000000000016e2d4	testb	$0x1, %al
000000000016e2d6	je	0x16e2e4
000000000016e2d8	movq	0x60(%r12), %rdx
000000000016e2dd	movq	0x68(%r12), %r12
000000000016e2e2	jmp	0x16e2ed
000000000016e2e4	addq	$0x59, %r12
000000000016e2e8	shrb	%al
000000000016e2ea	movzbl	%al, %edx
000000000016e2ed	leaq	-0x60(%rbp), %rdi
000000000016e2f1	movq	%r12, %rsi
000000000016e2f4	callq	__ZNKSt3__121__murmur2_or_cityhashImLm64EEclB9nqe210106EPKvm ## std::__1::__murmur2_or_cityhash<unsigned long, 64ul>::operator()[abi:nqe210106](void const*, unsigned long) const
000000000016e2f9	movq	%rax, %r14
000000000016e2fc	cmpq	-0x40(%rbp), %r15
000000000016e300	jae	0x16e36f
000000000016e302	movq	%r14, (%r15)
000000000016e305	addq	$0x8, %r15
000000000016e309	movq	%r15, %rbx
000000000016e30c	movq	-0x30(%rbp), %rdi
000000000016e310	cmpq	%rbx, %rdi
000000000016e313	je	0x16e410
000000000016e319	xorl	%edx, %edx
000000000016e31b	movabsq	$-0x61c8864680b583eb, %rax      ## imm = 0x9E3779B97F4A7C15
000000000016e325	movq	%rdi, %rcx
000000000016e328	movq	%rdx, %r14
000000000016e32b	nopl	(%rax,%rax)
000000000016e330	movq	%rdx, %rsi
000000000016e333	shlq	$0x6, %rsi
000000000016e337	shrq	$0x2, %r14
000000000016e33b	addq	%rsi, %r14
000000000016e33e	addq	(%rcx), %r14
000000000016e341	addq	%rax, %r14
000000000016e344	xorq	%rdx, %r14
000000000016e347	addq	$0x8, %rcx
000000000016e34b	movq	%r14, %rdx
000000000016e34e	cmpq	%rbx, %rcx
000000000016e351	jne	0x16e330
000000000016e353	testq	%rdi, %rdi
000000000016e356	je	0x16e35d
000000000016e358	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e35d	movq	%r14, %rax
000000000016e360	addq	$0x78, %rsp
000000000016e364	popq	%rbx
000000000016e365	popq	%r12
000000000016e367	popq	%r13
000000000016e369	popq	%r14
000000000016e36b	popq	%r15
000000000016e36d	popq	%rbp
000000000016e36e	retq
000000000016e36f	movq	-0x30(%rbp), %rcx
000000000016e373	subq	%rcx, %r15
000000000016e376	movq	%r15, %r13
000000000016e379	sarq	$0x3, %r13
000000000016e37d	leaq	0x1(%r13), %rax
000000000016e381	movabsq	$0x1fffffffffffffff, %rdx       ## imm = 0x1FFFFFFFFFFFFFFF
000000000016e38b	cmpq	%rdx, %rax
000000000016e38e	ja	0x16e485
000000000016e394	movq	-0x40(%rbp), %rsi
000000000016e398	subq	%rcx, %rsi
000000000016e39b	movq	%rsi, %rdi
000000000016e39e	sarq	$0x2, %rdi
000000000016e3a2	cmpq	%rax, %rdi
000000000016e3a5	cmovbeq	%rax, %rdi
000000000016e3a9	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
000000000016e3b3	cmpq	%rax, %rsi
000000000016e3b6	cmovaeq	%rdx, %rdi
000000000016e3ba	cmpq	%rdx, %rdi
000000000016e3bd	ja	0x16e48c
000000000016e3c3	shlq	$0x3, %rdi
000000000016e3c7	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016e3cc	movq	%rax, %r12
000000000016e3cf	movq	%r14, (%rax,%r15)
000000000016e3d3	leaq	(%rax,%r15), %rbx
000000000016e3d7	addq	$0x8, %rbx
000000000016e3db	addq	%r15, %r12
000000000016e3de	shlq	$0x3, %r13
000000000016e3e2	subq	%r13, %r12
000000000016e3e5	movq	%r12, %rdi
000000000016e3e8	movq	-0x30(%rbp), %r14
000000000016e3ec	movq	%r14, %rsi
000000000016e3ef	movq	%r15, %rdx
000000000016e3f2	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016e3f7	testq	%r14, %r14
000000000016e3fa	je	0x16e404
000000000016e3fc	movq	%r14, %rdi
000000000016e3ff	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e404	movq	%r12, %rdi
000000000016e407	cmpq	%rbx, %rdi
000000000016e40a	jne	0x16e319
000000000016e410	xorl	%r14d, %r14d
000000000016e413	testq	%rdi, %rdi
000000000016e416	jne	0x16e358
000000000016e41c	jmp	0x16e35d
000000000016e421	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e426	jmp	0x16e49f
000000000016e428	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e42d	jmp	0x16e49f
000000000016e42f	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e434	jmp	0x16e49f
000000000016e436	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e43b	jmp	0x16e49f
000000000016e43d	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e442	jmp	0x16e49f
000000000016e444	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e449	jmp	0x16e49f
000000000016e44b	movq	%r15, -0x30(%rbp)
000000000016e44f	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e454	jmp	0x16e49f
000000000016e456	movq	%r15, -0x30(%rbp)
000000000016e45a	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e45f	jmp	0x16e49f
000000000016e461	movq	%r12, -0x30(%rbp)
000000000016e465	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e46a	jmp	0x16e49f
000000000016e46c	movq	%rdx, -0x30(%rbp)
000000000016e470	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e475	jmp	0x16e49f
000000000016e477	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e47c	jmp	0x16e49f
000000000016e47e	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e483	jmp	0x16e49f
000000000016e485	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e48a	jmp	0x16e49f
000000000016e48c	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e491	jmp	0x16e49f
000000000016e493	callq	__ZNSt3__16vectorImNS_9allocatorImEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned long, std::__1::allocator<unsigned long>>::__throw_length_error[abi:nqe210106]()
000000000016e498	jmp	0x16e49f
000000000016e49a	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000016e49f	ud2
000000000016e4a1	movq	%rax, %rdi
000000000016e4a4	callq	___clang_call_terminate
000000000016e4a9	jmp	0x16e5f1
000000000016e4ae	movq	%rax, %rdi
000000000016e4b1	callq	___clang_call_terminate
000000000016e4b6	movq	%rax, %rdi
000000000016e4b9	callq	___clang_call_terminate
000000000016e4be	movq	%rax, %rdi
000000000016e4c1	callq	___clang_call_terminate
000000000016e4c6	jmp	0x16e5f1
000000000016e4cb	jmp	0x16e5f1
000000000016e4d0	movq	%r15, -0x30(%rbp)
000000000016e4d4	jmp	0x16e4ef
000000000016e4d6	jmp	0x16e594
000000000016e4db	jmp	0x16e594
000000000016e4e0	jmp	0x16e594
000000000016e4e5	movq	%rax, %rdi
000000000016e4e8	callq	___clang_call_terminate
000000000016e4ed	jmp	0x16e53c
000000000016e4ef	movq	%rax, %r14
000000000016e4f2	testb	$0x1, -0x60(%rbp)
000000000016e4f6	je	0x16e512
000000000016e4f8	movq	-0x50(%rbp), %rdi
000000000016e4fc	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e501	jmp	0x16e512
000000000016e503	movq	%rax, %rdi
000000000016e506	callq	___clang_call_terminate
000000000016e50b	movq	%r15, -0x30(%rbp)
000000000016e50f	movq	%rax, %r14
000000000016e512	testb	$0x1, -0x90(%rbp)
000000000016e519	je	0x16e53f
000000000016e51b	movq	-0x80(%rbp), %rdi
000000000016e51f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e524	jmp	0x16e53f
000000000016e526	movq	%r15, -0x30(%rbp)
000000000016e52a	jmp	0x16e53c
000000000016e52c	movq	%r15, -0x30(%rbp)
000000000016e530	movq	%rax, %r14
000000000016e533	jmp	0x16e5d1
000000000016e538	movq	%r12, -0x30(%rbp)
000000000016e53c	movq	%rax, %r14
000000000016e53f	movq	-0x70(%rbp), %rdi
000000000016e543	movq	(%rdi), %rax
000000000016e546	callq	*0x18(%rax)
000000000016e549	jmp	0x16e5d1
000000000016e54e	jmp	0x16e594
000000000016e550	jmp	0x16e594
000000000016e552	movq	%rax, %rdi
000000000016e555	callq	___clang_call_terminate
000000000016e55a	jmp	0x16e572
000000000016e55c	jmp	0x16e584
000000000016e55e	movq	%rax, %rdi
000000000016e561	callq	___clang_call_terminate
000000000016e566	jmp	0x16e572
000000000016e568	jmp	0x16e584
000000000016e56a	movq	%rax, %rdi
000000000016e56d	callq	___clang_call_terminate
000000000016e572	movq	%r15, -0x30(%rbp)
000000000016e576	movq	%rax, %r14
000000000016e579	testb	$0x1, -0x90(%rbp)
000000000016e580	je	0x16e5a6
000000000016e582	jmp	0x16e5c1
000000000016e584	movq	%r15, -0x30(%rbp)
000000000016e588	movq	%rax, %r14
000000000016e58b	cmpq	$0x0, -0x70(%rbp)
000000000016e590	jne	0x16e5d1
000000000016e592	jmp	0x16e5f4
000000000016e594	movq	%rax, %r14
000000000016e597	testb	$0x1, -0x60(%rbp)
000000000016e59b	jne	0x16e5af
000000000016e59d	testb	$0x1, -0x90(%rbp)
000000000016e5a4	jne	0x16e5c1
000000000016e5a6	cmpq	$0x0, -0x70(%rbp)
000000000016e5ab	jne	0x16e5d1
000000000016e5ad	jmp	0x16e5f4
000000000016e5af	movq	-0x50(%rbp), %rdi
000000000016e5b3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e5b8	testb	$0x1, -0x90(%rbp)
000000000016e5bf	je	0x16e5a6
000000000016e5c1	movq	-0x80(%rbp), %rdi
000000000016e5c5	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e5ca	cmpq	$0x0, -0x70(%rbp)
000000000016e5cf	je	0x16e5f4
000000000016e5d1	movq	-0x70(%rbp), %rdi
000000000016e5d5	movq	(%rdi), %rax
000000000016e5d8	callq	*0x18(%rax)
000000000016e5db	jmp	0x16e5f4
000000000016e5dd	movq	%rax, %rdi
000000000016e5e0	callq	___clang_call_terminate
000000000016e5e5	movq	%rax, %rdi
000000000016e5e8	callq	___clang_call_terminate
000000000016e5ed	movq	%r15, -0x30(%rbp)
000000000016e5f1	movq	%rax, %r14
000000000016e5f4	cmpq	$0x0, -0x30(%rbp)
000000000016e5f9	je	0x16e604
000000000016e5fb	movq	-0x30(%rbp), %rdi
000000000016e5ff	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016e604	movq	%r14, %rdi
000000000016e607	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016e60c	movq	%rax, %rdi
000000000016e60f	callq	___clang_call_terminate
000000000016e614	popq	%rbx
000000000016e615	hlt
000000000016e616	.byte 0xff #bad opcode
000000000016e617	pushq	-0xb(%rbx)
000000000016e61a	.byte 0xff #bad opcode
000000000016e61b	incl	%ebp
000000000016e61d	hlt
000000000016e61e	.byte 0xff #bad opcode
000000000016e61f	lcalll	*0x6666ffff(,%rsi,8)
000000000016e626	nopw	%cs:(%rax,%rax)
